package com.skillswap.backend.messaging.controller;

import com.skillswap.backend.auth.security.CustomUserDetails;
import com.skillswap.backend.common.dto.PageResponse;
import com.skillswap.backend.messaging.dto.ConversationSummaryResponse;
import com.skillswap.backend.messaging.dto.MessageResponse;
import com.skillswap.backend.messaging.dto.SendMessageRequest;
import com.skillswap.backend.messaging.service.MessagingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessagingController {

    private final MessagingService messagingService;

    @GetMapping("/conversations")
    public List<ConversationSummaryResponse> conversations(@AuthenticationPrincipal CustomUserDetails principal) {
        return messagingService.getConversations(principal.getId());
    }

    @GetMapping("/conversations/{conversationId}")
    public PageResponse<MessageResponse> getMessages(@AuthenticationPrincipal CustomUserDetails principal,
                                                      @PathVariable Long conversationId,
                                                      @RequestParam(required = false) Integer page,
                                                      @RequestParam(required = false) Integer size) {
        return messagingService.getMessages(conversationId, principal.getId(), page, size);
    }

    @PostMapping("/partners/{partnerId}")
    public MessageResponse sendMessage(@AuthenticationPrincipal CustomUserDetails principal,
                                        @PathVariable Long partnerId,
                                        @Valid @RequestBody SendMessageRequest request) {
        return messagingService.sendMessage(principal.getId(), partnerId, request.body());
    }
}
