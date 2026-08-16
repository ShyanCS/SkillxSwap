package com.skillswap.backend.admin.controller;

import com.skillswap.backend.admin.dto.AdminStatsResponse;
import com.skillswap.backend.admin.dto.AdminUserResponse;
import com.skillswap.backend.admin.service.AdminService;
import com.skillswap.backend.auth.security.CustomUserDetails;
import com.skillswap.backend.common.dto.PageResponse;
import com.skillswap.backend.report.dto.ReportResponse;
import com.skillswap.backend.report.service.ReportService;
import com.skillswap.backend.skill.dto.SkillCatalogResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/** Every endpoint here is admin-only, enforced by SecurityConfig's /api/admin/** rule. */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final ReportService reportService;

    @GetMapping("/stats")
    public AdminStatsResponse stats() {
        return adminService.getStats();
    }

    @GetMapping("/users")
    public PageResponse<AdminUserResponse> users(@RequestParam(required = false) String q,
                                                  @RequestParam(required = false) Integer page,
                                                  @RequestParam(required = false) Integer size) {
        return adminService.getUsers(q, page, size);
    }

    @PutMapping("/users/{id}/suspend")
    public AdminUserResponse suspendUser(@AuthenticationPrincipal CustomUserDetails principal, @PathVariable Long id) {
        return adminService.setUserEnabled(id, false, principal.getId());
    }

    @PutMapping("/users/{id}/activate")
    public AdminUserResponse activateUser(@AuthenticationPrincipal CustomUserDetails principal, @PathVariable Long id) {
        return adminService.setUserEnabled(id, true, principal.getId());
    }

    @GetMapping("/skills")
    public List<SkillCatalogResponse> skills() {
        return adminService.getSkills();
    }

    @DeleteMapping("/skills/{id}")
    public Map<String, String> deleteSkill(@PathVariable Long id) {
        adminService.deleteSkill(id);
        return Map.of("message", "Skill deleted");
    }

    @GetMapping("/reports")
    public List<ReportResponse> reports() {
        return reportService.getAllReports();
    }

    @PutMapping("/reports/{id}/resolve")
    public ReportResponse resolveReport(@PathVariable Long id) {
        return reportService.resolveReport(id);
    }
}
