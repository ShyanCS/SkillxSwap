package com.skillswap.backend.matching.dto;

import jakarta.validation.constraints.Pattern;

public record RespondRequest(
        @Pattern(regexp = "Accepted|Rejected", message = "must be 'Accepted' or 'Rejected'") String status) {}
