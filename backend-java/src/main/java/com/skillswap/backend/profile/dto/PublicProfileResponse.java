package com.skillswap.backend.profile.dto;

import com.skillswap.backend.skill.dto.UserSkillResponse;
import java.time.OffsetDateTime;
import java.util.List;

/**
 * Another user's profile as seen by a signed-in member. Deliberately excludes
 * email and any account-management fields -- only what's needed to decide
 * whether to exchange skills with this person.
 */
public record PublicProfileResponse(
        Long id,
        String name,
        String bio,
        String region,
        String timezone,
        String profilePictureUrl,
        double rating,
        int ratingCount,
        long completedSessions,
        OffsetDateTime joinedAt,
        List<UserSkillResponse> skillsOffered,
        List<UserSkillResponse> skillsRequested,
        List<ProfileReview> recentFeedback) {

    public record ProfileReview(
            Long id, String reviewerName, int rating, String comment, String skillName, OffsetDateTime createdAt) {}
}
