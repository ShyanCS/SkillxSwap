package com.skillswap.backend.matching.dto;

import com.skillswap.backend.auth.entity.User;

public record UserSummary(
        Long id,
        String name,
        String bio,
        String region,
        String timezone,
        String profilePictureUrl,
        Integer sessionsCompleted,
        Double rating) {
    public static UserSummary from(User user) {
        return new UserSummary(
                user.getId(),
                user.getName(),
                user.getBio(),
                user.getRegion(),
                user.getTimezone(),
                user.getProfilePictureUrl(),
                user.getSessionsCompleted(),
                user.getAverageRating().doubleValue());
    }
}
