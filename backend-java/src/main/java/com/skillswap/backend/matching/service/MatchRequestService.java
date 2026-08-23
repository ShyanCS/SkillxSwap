package com.skillswap.backend.matching.service;

import com.skillswap.backend.auth.entity.User;
import com.skillswap.backend.auth.repository.UserRepository;
import com.skillswap.backend.common.exception.ApiException;
import com.skillswap.backend.matching.dto.MatchRequestParticipant;
import com.skillswap.backend.matching.dto.MatchRequestResponse;
import com.skillswap.backend.matching.dto.RespondRequest;
import com.skillswap.backend.matching.dto.SendMatchRequestRequest;
import com.skillswap.backend.matching.entity.Match;
import com.skillswap.backend.matching.entity.MatchRequest;
import com.skillswap.backend.matching.repository.MatchRepository;
import com.skillswap.backend.matching.repository.MatchRequestRepository;
import com.skillswap.backend.notification.service.NotificationService;
import com.skillswap.backend.skill.dto.UserSkillResponse;
import com.skillswap.backend.skill.entity.UserSkill;
import com.skillswap.backend.skill.repository.UserSkillRepository;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MatchRequestService {

    private final MatchRequestRepository matchRequestRepository;
    private final MatchRepository matchRepository;
    private final UserSkillRepository userSkillRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Transactional
    public void sendRequest(Long senderId, SendMatchRequestRequest request) {
        if (request.receiverId().equals(senderId)) {
            throw ApiException.badRequest("Cannot send request to yourself");
        }
        User receiver = userRepository
                .findById(request.receiverId())
                .orElseThrow(() -> ApiException.badRequest("Receiver not found"));

        List<Long> offeredIds = request.skillsOffered().stream().distinct().toList();
        List<Long> requestedIds = request.skillsRequested().stream().distinct().toList();

        validateOwnership(offeredIds, receiver.getId(), "offer", "Receiver does not offer one of the selected skills");
        validateOwnership(requestedIds, senderId, "offer", "You do not offer one of the selected skills");

        var existing = matchRequestRepository.findFirstBySenderIdAndReceiverIdAndStatusIn(
                senderId, receiver.getId(), List.of("Pending", "Accepted"));

        if (existing.isPresent()) {
            MatchRequest matchRequest = existing.get();
            matchRequest.setSenderOfferedUserSkillIds(union(matchRequest.getSenderOfferedUserSkillIds(), requestedIds));
            matchRequest.setReceiverOfferedUserSkillIds(
                    union(matchRequest.getReceiverOfferedUserSkillIds(), offeredIds));
            matchRequestRepository.save(matchRequest);
            return;
        }

        MatchRequest matchRequest = MatchRequest.builder()
                .sender(userRepository.getReferenceById(senderId))
                .receiver(receiver)
                .status("Pending")
                .senderOfferedUserSkillIds(requestedIds.toArray(new Long[0]))
                .receiverOfferedUserSkillIds(offeredIds.toArray(new Long[0]))
                .build();
        matchRequestRepository.save(matchRequest);

        User sender = userRepository.findById(senderId).orElseThrow();
        notificationService.notify(
                receiver.getId(),
                "MATCH_REQUEST_RECEIVED",
                "New match request from " + sender.getName(),
                sender.getName() + " wants to exchange skills with you.");
    }

    private void validateOwnership(List<Long> ids, Long ownerId, String type, String errorMessage) {
        if (ids.isEmpty()) {
            return;
        }
        List<UserSkill> owned = userSkillRepository.findAllByIdInAndUserIdAndType(ids, ownerId, type);
        if (owned.size() != ids.size()) {
            throw ApiException.badRequest(errorMessage);
        }
    }

    private Long[] union(Long[] existing, List<Long> additional) {
        Set<Long> merged = new LinkedHashSet<>(List.of(existing));
        merged.addAll(additional);
        return merged.toArray(new Long[0]);
    }

    @Transactional(readOnly = true)
    public List<MatchRequestResponse> getIncoming(Long userId) {
        return matchRequestRepository.findByReceiverIdOrderByIdDesc(userId).stream()
                .map(r -> toResponse(r, MatchRequestParticipant.from(r.getSender()), null))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<MatchRequestResponse> getSent(Long userId) {
        return matchRequestRepository.findBySenderIdOrderByIdDesc(userId).stream()
                .map(r -> toResponse(r, null, MatchRequestParticipant.from(r.getReceiver())))
                .toList();
    }

    private MatchRequestResponse toResponse(
            MatchRequest r, MatchRequestParticipant sender, MatchRequestParticipant recipient) {
        List<UserSkillResponse> skillOffered = hydrate(r.getSenderOfferedUserSkillIds());
        List<UserSkillResponse> skillWanted = hydrate(r.getReceiverOfferedUserSkillIds());
        return new MatchRequestResponse(
                r.getId(),
                sender,
                recipient,
                skillOffered,
                skillWanted,
                r.getCreatedAt(),
                r.getStatus().toLowerCase());
    }

    private List<UserSkillResponse> hydrate(Long[] userSkillIds) {
        if (userSkillIds == null || userSkillIds.length == 0) {
            return List.of();
        }
        return userSkillRepository.findAllByIdIn(List.of(userSkillIds)).stream()
                .map(UserSkillResponse::from)
                .toList();
    }

    @Transactional
    public MatchRequestResponse respond(Long requestId, Long userId, RespondRequest request) {
        MatchRequest matchRequest = matchRequestRepository
                .findById(requestId)
                .orElseThrow(() -> ApiException.notFound("Request not found"));

        if (!matchRequest.getReceiver().getId().equals(userId)) {
            throw ApiException.forbidden("Not authorized");
        }

        matchRequest.setStatus(request.status());
        matchRequestRepository.save(matchRequest);

        if ("Accepted".equals(request.status())) {
            Match match = Match.builder()
                    .matchRequest(matchRequest)
                    .user1(matchRequest.getSender())
                    .user2(matchRequest.getReceiver())
                    .build();
            matchRepository.save(match);
        }

        String receiverName = matchRequest.getReceiver().getName();
        notificationService.notify(
                matchRequest.getSender().getId(),
                "MATCH_REQUEST_" + request.status().toUpperCase(),
                receiverName + (request.status().equals("Accepted") ? " accepted" : " declined")
                        + " your match request",
                "Accepted".equals(request.status())
                        ? receiverName
                                + " accepted your skill exchange request. You can now message and schedule sessions."
                        : receiverName + " declined your skill exchange request.");

        return toResponse(matchRequest, MatchRequestParticipant.from(matchRequest.getSender()), null);
    }
}
