package com.skillswap.backend.matching.service;

import com.skillswap.backend.auth.entity.User;
import com.skillswap.backend.auth.repository.UserRepository;
import com.skillswap.backend.availability.service.AvailabilityService;
import com.skillswap.backend.common.exception.ApiException;
import com.skillswap.backend.matching.dto.MatchResultResponse;
import com.skillswap.backend.matching.dto.MatchSkillItem;
import com.skillswap.backend.matching.dto.UserSummary;
import com.skillswap.backend.skill.entity.UserSkill;
import com.skillswap.backend.skill.repository.UserSkillRepository;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
            Set<String> mutualInterests) {
        static Entry empty(User user) {
            return new Entry(user, new ArrayList<>(), new ArrayList<>(), new LinkedHashSet<>());
        }
    }

    /** Weekly shared minutes at which availability stops improving the score (8h). */
    private static final int FULLY_COMPATIBLE_OVERLAP_MINUTES = 8 * 60;
    /** Skill fit still dominates; availability can lift a score by at most 30%. */
    private static final float SKILL_WEIGHT = 0.7f;

    private static final float AVAILABILITY_WEIGHT = 0.3f;

    private final UserSkillRepository userSkillRepository;
    private final UserRepository userRepository;
    private final AvailabilityService availabilityService;

    @Transactional(readOnly = true)
    public List<MatchResultResponse> computeMatches(Long currentUserId) {
        List<UserSkill> myOffered = userSkillRepository.findByUserIdAndType(currentUserId, "offer");
        List<UserSkill> myRequested = userSkillRepository.findByUserIdAndType(currentUserId, "request");

        Map<Long, UserSkill> myOfferedBySkillId =
                myOffered.stream().collect(Collectors.toMap(us -> us.getSkill().getId(), us -> us, (a, b) -> a));

        List<Long> myRequestedSkillIds =
                myRequested.stream().map(us -> us.getSkill().getId()).distinct().toList();
        List<Long> myOfferedSkillIds = myOfferedBySkillId.keySet().stream().toList();

        List<UserSkill> othersOfferingWhatIWant = myRequestedSkillIds.isEmpty()
                ? List.of()
                : userSkillRepository.findByTypeAndSkill_IdInAndUser_IdNot("offer", myRequestedSkillIds, currentUserId);
        List<UserSkill> othersWantingWhatIOffer = myOfferedSkillIds.isEmpty()
                ? List.of()
                : userSkillRepository.findByTypeAndSkill_IdInAndUser_IdNot("request", myOfferedSkillIds, currentUserId);

        Map<Long, Entry> byUser = new LinkedHashMap<>();

        for (UserSkill theirOffer : othersOfferingWhatIWant) {
            Entry entry = byUser.computeIfAbsent(theirOffer.getUser().getId(), id -> Entry.empty(theirOffer.getUser()));
            entry.skillsOffered()
                    .add(new MatchSkillItem(
                            theirOffer.getId(),
                            theirOffer.getSkill().getId(),
                            theirOffer.getSkill().getName(),
                            theirOffer.getProficiencyLevel(),
                            null,
                            theirOffer.getDescription()));
            entry.mutualInterests().add(theirOffer.getSkill().getName());
        }

        for (UserSkill theirRequest : othersWantingWhatIOffer) {
            Entry entry =
                    byUser.computeIfAbsent(theirRequest.getUser().getId(), id -> Entry.empty(theirRequest.getUser()));
            UserSkill myOfferForThisSkill =
                    myOfferedBySkillId.get(theirRequest.getSkill().getId());
            if (myOfferForThisSkill == null) {
                continue; // shouldn't happen given the query filter, but guard anyway
            }
            entry.skillsRequested()
                    .add(new MatchSkillItem(
                            myOfferForThisSkill.getId(),
                            theirRequest.getSkill().getId(),
                            theirRequest.getSkill().getName(),
                            null,
                            theirRequest.getDesiredProficiency(),
                            theirRequest.getDescription()));
            entry.mutualInterests().add(theirRequest.getSkill().getName());
        }

        int myTotalListings = myOffered.size() + myRequested.size();

        List<Entry> reciprocal = byUser.values().stream()
                .filter(e ->
                        !e.skillsOffered().isEmpty() && !e.skillsRequested().isEmpty())
                .toList();

        User viewer = userRepository.findById(currentUserId).orElseThrow(() -> ApiException.notFound("User not found"));
        Map<Long, Integer> overlapByUser = availabilityService.weeklyOverlapMinutes(
                viewer, reciprocal.stream().map(Entry::user).toList());

        List<MatchResultResponse> results = new ArrayList<>();
        for (Entry entry : reciprocal) {
            int rawCount =
                    entry.skillsOffered().size() + entry.skillsRequested().size();
            int skillScore = myTotalListings == 0 ? 0 : Math.min(100, Math.round(rawCount * 100f / myTotalListings));
            int score = applyAvailabilityWeight(
                    skillScore, overlapByUser.get(entry.user().getId()));
            results.add(new MatchResultResponse(
                    entry.user().getId(),
                    UserSummary.from(entry.user()),
                    entry.skillsOffered(),
                    entry.skillsRequested(),
                    score,
                    entry.mutualInterests().stream().toList(),
                    "Just now"));
        }

        results.sort((a, b) -> b.compatibilityScore() - a.compatibilityScore());
        return results;
    }

    /**
     * Blends shared free time into the skill score.
     *
     * Two people whose skills line up perfectly but who are never free at the
     * same hour are not, in practice, a good match, so overlap moves the score
     * rather than being shown as a separate number the user has to reconcile.
     *
     * A null overlap means at least one side has not declared availability.
     * That is unknown, not incompatible, so the skill score is left untouched
     * -- penalising it would push every new user to the bottom of everyone's
     * list before they had a chance to fill anything in.
     */
    private int applyAvailabilityWeight(int skillScore, Integer overlapMinutes) {
        if (overlapMinutes == null) {
            return skillScore;
        }
        // Saturates at a working day per week of shared time: beyond that, more
        // overlap says little extra about whether a session can be arranged.
        float availabilityFactor = Math.min(1f, overlapMinutes / (float) FULLY_COMPATIBLE_OVERLAP_MINUTES);
        float blended = skillScore * (SKILL_WEIGHT + AVAILABILITY_WEIGHT * availabilityFactor);
        return Math.max(0, Math.min(100, Math.round(blended)));
    }
}
