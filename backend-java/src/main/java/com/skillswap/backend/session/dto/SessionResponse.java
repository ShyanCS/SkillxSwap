package com.skillswap.backend.session.dto;

import com.skillswap.backend.matching.dto.UserSummary;
import com.skillswap.backend.session.entity.Session;
import java.time.OffsetDateTime;

public record SessionResponse(
        Long id,
        UserSummary partner,
        SchedulableSkill skill,
        String role,
        OffsetDateTime startTime,
        OffsetDateTime endTime,
        Integer duration,
        String type,
        String location,
        String notes,
        String status,
        OffsetDateTime createdAt) {
    public static SessionResponse from(Session session, Long viewerId) {
        boolean viewerIsTeacher = session.getTeacher().getId().equals(viewerId);
        var partnerUser = viewerIsTeacher ? session.getLearner() : session.getTeacher();
        return new SessionResponse(
                session.getId(),
                UserSummary.from(partnerUser),
                new SchedulableSkill(
                        session.getSkill().getId(), session.getSkill().getName(), session.getNotes()),
                viewerIsTeacher ? "teacher" : "learner",
                session.getScheduledAt(),
                session.getScheduledAt().plusMinutes(session.getDurationMinutes()),
                session.getDurationMinutes(),
                session.getSessionType(),
                session.getLocation(),
                session.getNotes(),
                session.getStatus().toLowerCase(),
                session.getCreatedAt());
    }
}
