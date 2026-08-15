package com.skillswap.backend.auth.dto;

import com.skillswap.backend.auth.entity.Role;
import com.skillswap.backend.auth.entity.User;

public record UserResponse(
        Long id,
        String name,
        String email,
        String bio,
        String region,
        String timezone,
        String profilePictureUrl,
        Integer karmaPoints,
        Role role,
        Double rating
) {
    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getBio(),
                user.getRegion(),
                user.getTimezone(),
                user.getProfilePictureUrl(),
                user.getKarmaPoints(),
                user.getRole(),
                user.getAverageRating().doubleValue()
        );
    }
}
