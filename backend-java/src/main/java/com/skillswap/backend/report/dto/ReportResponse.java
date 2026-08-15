package com.skillswap.backend.report.dto;

import com.skillswap.backend.report.entity.Report;

import java.time.OffsetDateTime;

public record ReportResponse(
        Long id,
        Long reporterId,
        String reporterName,
        Long reportedUserId,
        String reportedUserName,
        String reason,
        String status,
        OffsetDateTime createdAt
) {
    public static ReportResponse from(Report report) {
        return new ReportResponse(
                report.getId(),
                report.getReporter().getId(),
                report.getReporter().getName(),
                report.getReportedUser().getId(),
                report.getReportedUser().getName(),
                report.getReason(),
                report.getStatus(),
                report.getCreatedAt()
        );
    }
}
