package com.skillswap.backend.review.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record CreateReviewRequest(@NotNull Long sessionId, @NotNull @Min(1) @Max(5) Integer rating, String comment) {}
