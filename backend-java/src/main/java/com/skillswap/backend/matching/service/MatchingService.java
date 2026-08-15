package com.skillswap.backend.matching.service;

import com.skillswap.backend.auth.entity.User;
import com.skillswap.backend.matching.dto.MatchResultResponse;
import com.skillswap.backend.matching.dto.MatchSkillItem;
import com.skillswap.backend.matching.dto.UserSummary;
import com.skillswap.backend.skill.entity.UserSkill;
import com.skillswap.backend.skill.repository.UserSkillRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Rule-based reciprocal matcher: a candidate only appears if there's mutual
 * interest (they offer something I want AND want something I offer).
 * compatibilityScore is normalized to 0-100 (matched skill count relative to
 * how many skills I've listed), unlike the Node version's raw unbounded count.
 */
@Service
@RequiredArgsConstructor
public class MatchingService {

    private record Entry(
            User user,
            List<MatchSkillItem> skillsOffered,
            List<MatchSkillItem> skillsRequested,
            Set<String> mutualInterests
    ) {
        static Entry empty(User user) {
            return new Entry(user, new ArrayList<>(), new ArrayList<>(), new LinkedHashSet<>());
        }
    }

    private final UserSkillRepository userSkillRepository;

    @Transactional(readOnly = true)
    public List<MatchResultResponse> computeMatches(Long currentUserId) {
        List<UserSkill> myOffered = userSkillRepository.findByUserIdAndType(currentUserId, "offer");
        List<UserSkill> myRequested = userSkillRepository.findByUserIdAndType(currentUserId, "request");

        Map<Long, UserSkill> myOfferedBySkillId = myOffered.stream()
                .collect(Collectors.toMap(us -> us.getSkill().getId(), us -> us, (a, b) -> a));

        List<Long> myRequestedSkillIds = myRequested.stream().map(us -> us.getSkill().getId()).distinct().toList();
        List<Long> myOfferedSkillIds = myOfferedBySkillId.keySet().stream().toList();

        List<UserSkill> othersOfferingWhatIWant = myRequestedSkillIds.isEmpty() ? List.of()
                : userSkillRepository.findByTypeAndSkill_IdInAndUser_IdNot("offer", myRequestedSkillIds, currentUserId);
        List<UserSkill> othersWantingWhatIOffer = myOfferedSkillIds.isEmpty() ? List.of()
                : userSkillRepository.findByTypeAndSkill_IdInAndUser_IdNot("request", myOfferedSkillIds, currentUserId);

        Map<Long, Entry> byUser = new LinkedHashMap<>();

        for (UserSkill theirOffer : othersOfferingWhatIWant) {
            Entry entry = byUser.computeIfAbsent(theirOffer.getUser().getId(), id -> Entry.empty(theirOffer.getUser()));
            entry.skillsOffered().add(new MatchSkillItem(
                    theirOffer.getId(),
                    theirOffer.getSkill().getId(),
                    theirOffer.getSkill().getName(),
                    theirOffer.getProficiencyLevel(),
                    null,
                    theirOffer.getDescription()
            ));
            entry.mutualInterests().add(theirOffer.getSkill().getName());
        }

        for (UserSkill theirRequest : othersWantingWhatIOffer) {
            Entry entry = byUser.computeIfAbsent(theirRequest.getUser().getId(), id -> Entry.empty(theirRequest.getUser()));
            UserSkill myOfferForThisSkill = myOfferedBySkillId.get(theirRequest.getSkill().getId());
            if (myOfferForThisSkill == null) {
                continue; // shouldn't happen given the query filter, but guard anyway
            }
            entry.skillsRequested().add(new MatchSkillItem(
                    myOfferForThisSkill.getId(),
                    theirRequest.getSkill().getId(),
                    theirRequest.getSkill().getName(),
                    null,
                    theirRequest.getDesiredProficiency(),
                    theirRequest.getDescription()
            ));
            entry.mutualInterests().add(theirRequest.getSkill().getName());
        }

        int myTotalListings = myOffered.size() + myRequested.size();

        List<MatchResultResponse> results = new ArrayList<>();
        for (Entry entry : byUser.values()) {
            if (entry.skillsOffered().isEmpty() || entry.skillsRequested().isEmpty()) {
                continue; // mutual interest only
            }
            int rawCount = entry.skillsOffered().size() + entry.skillsRequested().size();
            int score = myTotalListings == 0 ? 0 : Math.min(100, Math.round(rawCount * 100f / myTotalListings));
            results.add(new MatchResultResponse(
                    entry.user().getId(),
                    UserSummary.from(entry.user()),
                    entry.skillsOffered(),
                    entry.skillsRequested(),
                    score,
                    entry.mutualInterests().stream().toList(),
                    "Just now"
            ));
        }

        results.sort((a, b) -> b.compatibilityScore() - a.compatibilityScore());
        return results;
    }
}
