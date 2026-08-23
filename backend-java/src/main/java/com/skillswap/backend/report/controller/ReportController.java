package com.skillswap.backend.report.controller;

import com.skillswap.backend.auth.security.CustomUserDetails;
import com.skillswap.backend.report.dto.CreateReportRequest;
import com.skillswap.backend.report.dto.ReportResponse;
import com.skillswap.backend.report.service.ReportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Submission is open to any authenticated user; viewing/resolving is admin-only (see AdminController). */
@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @PostMapping
    public ReportResponse create(
            @AuthenticationPrincipal CustomUserDetails principal, @Valid @RequestBody CreateReportRequest request) {
        return reportService.createReport(principal.getId(), request);
    }
}
