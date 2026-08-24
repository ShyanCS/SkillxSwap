package com.skillswap.backend.session.service;

import com.skillswap.backend.auth.entity.User;
import com.skillswap.backend.auth.repository.UserRepository;
import com.skillswap.backend.availability.service.AvailabilityService;
import com.skillswap.backend.common.exception.ApiException;
import com.skillswap.backend.matching.dto.UserSummary;
import com.skillswap.backend.matching.entity.Match;
import com.skillswap.backend.matching.entity.MatchRequest;
import com.skillswap.backend.matching.repository.MatchRepository;
import com.skillswap.backend.notification.service.NotificationService;
import com.skillswap.backend.session.dto.CreateSessionRequest;
import com.skillswap.backend.session.dto.SchedulableMatchResponse;
import com.skillswap.backend.session.dto.SchedulableSkill;
import com.skillswap.backend.session.dto.SessionResponse;
import com.skillswap.backend.session.entity.Session;
import com.skillswap.backend.session.repository.SessionRepository;
import com.skillswap.backend.skill.repository.SkillRepository;
import com.skillswap.backend.skill.repository.UserSkillRepository;
import com.skillswap.backend.wallet.service.WalletService;
import java.time.OffsetDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SessionService {

    private final MatchRepository matchRepository;
    private final SessionRepository sessionRepository;
    private final SkillRepository skillRepository;
    private final UserSkillRepository userSkillRepository;
    private final UserRepository userRepository;
    private final WalletService walletService;
    private final NotificationService notificationService;
    private final AvailabilityService availabilityService;

    @Transactional(readOnly = true)
    public List<SchedulableMatchResponse> getSchedulableMatches(Long userId) {
        return matchRepository.findAllForUser(userId).stream()
                .map(match -> toSchedulableMatch(match, userId))
                .toList();
    }

    private SchedulableMatchResponse toSchedulableMatch(Match match, Long userId) {
        var partnerUser = match.getUser1().getId().equals(userId) ? match.getUser2() : match.getUser1();
        MatchRequest matchRequest = match.getMatchRequest();

        Long[] myOfferedIds;
        Long[] partnerOfferedIds;
        if (matchRequest.getSender().getId().equals(userId)) {
            myOfferedIds = matchRequest.getSenderOfferedUserSkillIds();
            partnerOfferedIds = matchRequest.getReceiverOfferedUserSkillIds();
        } else {
            myOfferedIds = matchRequest.getReceiverOfferedUserSkillIds();
            partnerOfferedIds = matchRequest.getSenderOfferedUserSkillIds();
        }

        return new SchedulableMatchResponse(
                match.getId(),
                UserSummary.from(partnerUser),
                hydrateSkills(partnerOfferedIds),
                hydrateSkills(myOfferedIds));
    }

    private List<SchedulableSkill> hydrateSkills(Long[] userSkillIds) {
        if (userSkillIds == null || userSkillIds.length == 0) {
            return List.of();
        }
        return userSkillRepository.findAllByIdIn(List.of(userSkillIds)).stream()
                .map(us -> new SchedulableSkill(
                        us.getSkill().getId(), us.getSkill().getName(), us.getDescription()))
                .toList();
    }

    @Transactional
    public SessionResponse createSession(Long viewerId, CreateSessionRequest request) {
        Match match = matchRepository
                .findById(request.matchId())
                .orElseThrow(() -> ApiException.badRequest("Match not found"));

        Long user1Id = match.getUser1().getId();
        Long user2Id = match.getUser2().getId();
        if (!viewerId.equals(user1Id) && !viewerId.equals(user2Id)) {
            throw ApiException.forbidden("Not a participant in this match");
        }
        if (!request.teacherId().equals(user1Id) && !request.teacherId().equals(user2Id)) {
            throw ApiException.badRequest("Teacher must be a participant in this match");
        }
        Long learnerId = request.teacherId().equals(user1Id) ? user2Id : user1Id;

        userSkillRepository
                .findFirstByUserIdAndTypeAndSkillId(request.teacherId(), "offer", request.skillId())
                .orElseThrow(() -> ApiException.badRequest("Teacher does not offer this skill"));

        User teacher = userRepository
                .findById(request.teacherId())
                .orElseThrow(() -> ApiException.badRequest("Teacher not found"));
        User learner =
                userRepository.findById(learnerId).orElseThrow(() -> ApiException.badRequest("Learner not found"));

        requireInFuture(request.scheduledAt());
        requireBothAvailable(teacher, learner, request.scheduledAt(), request.durationMinutes());
        requireNoClash(teacher, learner, request.scheduledAt(), request.durationMinutes());

        Session session = Session.builder()
                .match(match)
                .skill(skillRepository.getReferenceById(request.skillId()))
                .teacher(userRepository.getReferenceById(request.teacherId()))
                .learner(userRepository.getReferenceById(learnerId))
                .scheduledAt(request.scheduledAt())
                .durationMinutes(request.durationMinutes())
                .sessionType(request.sessionType())
                .location(request.location())
                .notes(request.notes())
                .status("Scheduled")
                .build();

        Session saved = sessionRepository.save(session);

        Long otherParticipantId = viewerId.equals(user1Id) ? user2Id : user1Id;
        User viewer = userRepository.findById(viewerId).orElseThrow();
        notificationService.notify(
                otherParticipantId,
                "SESSION_SCHEDULED",
                viewer.getName() + " scheduled a session with you",
                "A " + session.getSkill().getName() + " session is scheduled for " + session.getScheduledAt() + ".");

        return SessionResponse.from(saved, viewerId);
    }

    private void requireInFuture(OffsetDateTime scheduledAt) {
        // A small grace window absorbs clock skew between the client's picker
        // and the server rather than rejecting a legitimate "starting now".
        if (scheduledAt.isBefore(OffsetDateTime.now().minusMinutes(5))) {
            throw ApiException.badRequest("Sessions cannot be scheduled in the past.");
        }
    }

    private void requireBothAvailable(User teacher, User learner, OffsetDateTime startsAt, int durationMinutes) {
        if (!availabilityService.isAvailableFor(teacher, startsAt, durationMinutes)) {
            throw ApiException.badRequest(teacher.getName() + " is not available at that time.");
        }
        if (!availabilityService.isAvailableFor(learner, startsAt, durationMinutes)) {
            throw ApiException.badRequest(learner.getName() + " is not available at that time.");
        }
    }

    /**
     * Rejects a session that would overlap one either participant already has.
     *
     * Declared availability says when someone is willing to teach; it says
     * nothing about what they have already committed to, so both checks are
     * needed to stop the same hour being sold twice.
     */
    private void requireNoClash(User teacher, User learner, OffsetDateTime startsAt, int durationMinutes) {
        OffsetDateTime endsAt = startsAt.plusMinutes(durationMinutes);
        // Widened on the low side so an earlier, longer session that runs into
        // this slot is still considered.
        List<Session> nearby = sessionRepository.findScheduledForUsersBetween(
                List.of(teacher.getId(), learner.getId()), startsAt.minusDays(1), endsAt);

        for (Session existing : nearby) {
            OffsetDateTime existingEnd = existing.getScheduledAt().plusMinutes(existing.getDurationMinutes());
            boolean overlaps = existing.getScheduledAt().isBefore(endsAt) && startsAt.isBefore(existingEnd);
            if (overlaps) {
                boolean teacherIsBusy = existing.getTeacher().getId().equals(teacher.getId())
                        || existing.getLearner().getId().equals(teacher.getId());
                String who = teacherIsBusy ? teacher.getName() : learner.getName();
                throw ApiException.badRequest(who + " already has a session booked at that time.");
            }
        }
    }

    @Transactional(readOnly = true)
    public List<SessionResponse> getMySessions(Long userId) {
        return sessionRepository.findAllForUser(userId).stream()
                .map(s -> SessionResponse.from(s, userId))
                .toList();
    }

    @Transactional
    public SessionResponse updateStatus(Long sessionId, Long userId, String newStatus) {
        Session session =
                sessionRepository.findById(sessionId).orElseThrow(() -> ApiException.notFound("Session not found"));

        if (!session.getTeacher().getId().equals(userId)
                && !session.getLearner().getId().equals(userId)) {
            throw ApiException.forbidden("Not a participant in this session");
        }

        boolean transitioningToCompleted = "Completed".equals(newStatus) && !"Completed".equals(session.getStatus());

        session.setStatus(newStatus);
        Session saved = sessionRepository.save(session);

        // Guarded by the status-transition check above so a session is only
        // ever credited once, even if "complete" is called again.
        if (transitioningToCompleted) {
            walletService.transferForSession(saved);
            userRepository.incrementSessionsCompleted(
                    List.of(saved.getTeacher().getId(), saved.getLearner().getId()));
        }

        return SessionResponse.from(saved, userId);
    }
}
