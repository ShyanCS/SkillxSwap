package com.skillswap.backend.profile.dto;

public record UpdateProfileRequest(
        String profilePictureUrl,
        String bio,
        String region,
        String timezone
) {
}
