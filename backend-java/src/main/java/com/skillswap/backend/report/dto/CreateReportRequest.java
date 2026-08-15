package com.skillswap.backend.report.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateReportRequest(
        @NotNull Long reportedUserId,
        @NotBlank String reason
) {
}
