package com.skillswap.backend.session.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import java.time.OffsetDateTime;

public record CreateSessionRequest(
        @NotNull Long matchId,
        @NotNull Long skillId,
        @NotNull Long teacherId,
        @NotNull OffsetDateTime scheduledAt,
        @NotNull @Min(15) Integer durationMinutes,
        @Pattern(regexp = "online|in-person") String sessionType,
        String location,
        String notes) {}
