package com.skillswap.backend.notification.dto;

import com.skillswap.backend.notification.entity.Notification;
import java.time.OffsetDateTime;

public record NotificationResponse(
        Long id, String type, String title, String body, boolean read, OffsetDateTime createdAt) {
    public static NotificationResponse from(Notification n) {
        return new NotificationResponse(
                n.getId(), n.getType(), n.getTitle(), n.getBody(), n.getReadAt() != null, n.getCreatedAt());
    }
}
