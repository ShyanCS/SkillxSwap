package com.skillswap.backend.dashboard.dto;

import com.skillswap.backend.session.dto.SessionResponse;

import java.time.OffsetDateTime;
import java.util.List;

public record DashboardResponse(
        Stats stats,
        List<SessionResponse> upcomingSessions,
        List<ActivityItem> recentActivity
) {

    public record Stats(
            long activeMatches,
            long completedSessions,
            int creditBalance,
            long skillsOffered,
            long skillsRequested
    ) {
    }

    /**
     * Derived from the notification feed rather than a separate activity log --
     * every event worth showing here (match accepted, session scheduled, review
     * received, message received) already writes a notification.
     */
    public record ActivityItem(
            Long id,
            String type,
            String title,
            String body,
            OffsetDateTime createdAt
    ) {
    }
}
