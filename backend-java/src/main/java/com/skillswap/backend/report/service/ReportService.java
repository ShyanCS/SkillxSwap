package com.skillswap.backend.report.service;

import com.skillswap.backend.auth.entity.User;
import com.skillswap.backend.auth.repository.UserRepository;
import com.skillswap.backend.common.exception.ApiException;
import com.skillswap.backend.report.dto.CreateReportRequest;
import com.skillswap.backend.report.dto.ReportResponse;
import com.skillswap.backend.report.entity.Report;
import com.skillswap.backend.report.repository.ReportRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;

    @Transactional
    public ReportResponse createReport(Long reporterId, CreateReportRequest request) {
        if (request.reportedUserId().equals(reporterId)) {
            throw ApiException.badRequest("You cannot report yourself");
        }
        User reportedUser = userRepository
                .findById(request.reportedUserId())
                .orElseThrow(() -> ApiException.badRequest("Reported user not found"));

        Report report = Report.builder()
                .reporter(userRepository.getReferenceById(reporterId))
                .reportedUser(reportedUser)
                .reason(request.reason())
                .status("Open")
                .build();
        return ReportResponse.from(reportRepository.save(report));
    }

    @Transactional(readOnly = true)
    public List<ReportResponse> getAllReports() {
        return reportRepository.findAllByOrderByIdDesc().stream()
                .map(ReportResponse::from)
                .toList();
    }

    @Transactional
    public ReportResponse resolveReport(Long reportId) {
        Report report =
                reportRepository.findById(reportId).orElseThrow(() -> ApiException.notFound("Report not found"));
        report.setStatus("Resolved");
        return ReportResponse.from(reportRepository.save(report));
    }
}
