package com.skillswap.backend.admin.dto;

public record AdminStatsResponse(
        long totalUsers,
        long totalSkillsInCatalog,
        long scheduledSessions,
        long completedSessions,
        long creditsInCirculation,
        long openReports) {}
