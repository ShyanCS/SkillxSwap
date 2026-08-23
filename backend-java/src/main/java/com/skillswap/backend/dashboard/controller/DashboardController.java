package com.skillswap.backend.dashboard.controller;

import com.skillswap.backend.auth.security.CustomUserDetails;
import com.skillswap.backend.dashboard.dto.DashboardResponse;
import com.skillswap.backend.dashboard.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    public DashboardResponse dashboard(@AuthenticationPrincipal CustomUserDetails principal) {
        return dashboardService.getDashboard(principal.getId());
    }
}
