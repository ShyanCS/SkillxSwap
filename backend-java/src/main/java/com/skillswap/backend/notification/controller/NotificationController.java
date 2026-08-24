package com.skillswap.backend.notification.controller;

import com.skillswap.backend.auth.security.CustomUserDetails;
import com.skillswap.backend.common.dto.PageResponse;
import com.skillswap.backend.notification.dto.NotificationResponse;
import com.skillswap.backend.notification.service.NotificationService;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public PageResponse<NotificationResponse> list(
            @AuthenticationPrincipal CustomUserDetails principal,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {
        return notificationService.getNotifications(principal.getId(), page, size);
    }

    @GetMapping("/unread-count")
    public Map<String, Long> unreadCount(@AuthenticationPrincipal CustomUserDetails principal) {
        return notificationService.getUnreadCount(principal.getId());
    }

    @PutMapping("/{id}/read")
    public Map<String, String> markRead(@AuthenticationPrincipal CustomUserDetails principal, @PathVariable Long id) {
        notificationService.markRead(id, principal.getId());
        return Map.of("message", "Marked as read");
    }
}
