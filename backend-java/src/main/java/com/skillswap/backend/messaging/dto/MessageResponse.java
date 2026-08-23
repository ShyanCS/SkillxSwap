package com.skillswap.backend.messaging.dto;

import com.skillswap.backend.messaging.entity.Message;
import java.time.OffsetDateTime;

public record MessageResponse(Long id, Long senderId, String body, OffsetDateTime sentAt, boolean read) {
    public static MessageResponse from(Message message) {
        return new MessageResponse(
                message.getId(),
                message.getSender().getId(),
                message.getBody(),
                message.getSentAt(),
                message.getReadAt() != null);
    }
}
