package com.skillswap.backend.matching.dto;

import com.skillswap.backend.auth.entity.User;

public record MatchRequestParticipant(Long id, String name, String profilePictureUrl, Integer karmaPoints, Double rating) {
    public static MatchRequestParticipant from(User user) {
        return new MatchRequestParticipant(user.getId(), user.getName(), user.getProfilePictureUrl(), user.getKarmaPoints(), user.getAverageRating().doubleValue());
    }
}
