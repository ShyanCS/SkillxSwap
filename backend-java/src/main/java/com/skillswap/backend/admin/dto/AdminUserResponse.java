package com.skillswap.backend.admin.dto;

import com.skillswap.backend.auth.entity.Role;
import com.skillswap.backend.auth.entity.User;

import java.time.OffsetDateTime;

public record AdminUserResponse(
        Long id,
        String name,
        String email,
        Role role,
        boolean enabled,
        Double rating,
        OffsetDateTime createdAt
) {
    public static AdminUserResponse from(User user) {
        return new AdminUserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                Boolean.TRUE.equals(user.getEnabled()),
                user.getAverageRating().doubleValue(),
                user.getCreatedAt()
        );
    }
}
