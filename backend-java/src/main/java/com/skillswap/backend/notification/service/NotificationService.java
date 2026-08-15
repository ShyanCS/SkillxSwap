package com.skillswap.backend.notification.service;

import com.skillswap.backend.auth.entity.User;
import com.skillswap.backend.auth.repository.UserRepository;
import com.skillswap.backend.common.exception.ApiException;
import com.skillswap.backend.common.mail.MailService;
import com.skillswap.backend.notification.dto.NotificationResponse;
import com.skillswap.backend.notification.entity.Notification;
import com.skillswap.backend.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final MailService mailService;

    /**
     * Records an in-app notification and best-effort emails it. Called by
     * other modules (match, session, review, messaging) as their side
     * effects happen -- email failures are logged, not propagated, so a
     * flaky SMTP connection never rolls back the triggering action (e.g. a
     * successfully-sent chat message shouldn't fail just because the
     * notification email didn't go out).
     */
    @Transactional
    public void notify(Long userId, String type, String title, String body) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.badRequest("User not found"));

        notificationRepository.save(Notification.builder()
                .user(user)
                .type(type)
                .title(title)
                .body(body)
                .build());

        try {
            mailService.send(user.getEmail(), title, body);
        } catch (Exception e) {
            log.warn("Failed to send notification email to {}: {}", user.getEmail(), e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByIdDesc(userId).stream()
                .map(NotificationResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public Map<String, Long> getUnreadCount(Long userId) {
        return Map.of("unreadCount", notificationRepository.countByUserIdAndReadAtIsNull(userId));
    }

    @Transactional
    public void markRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findByIdAndUserId(notificationId, userId)
                .orElseThrow(() -> ApiException.notFound("Notification not found"));
        if (notification.getReadAt() == null) {
            notification.setReadAt(java.time.OffsetDateTime.now());
            notificationRepository.save(notification);
        }
    }
}
