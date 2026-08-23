package com.skillswap.backend.messaging.dto;

import com.skillswap.backend.matching.dto.UserSummary;

public record ConversationSummaryResponse(
        Long conversationId, UserSummary partner, MessageResponse lastMessage, long unreadCount) {}
