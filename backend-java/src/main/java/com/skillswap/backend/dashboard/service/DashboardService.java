package com.skillswap.backend.dashboard.service;

import com.skillswap.backend.dashboard.dto.DashboardResponse;
import com.skillswap.backend.matching.repository.MatchRepository;
import com.skillswap.backend.notification.repository.NotificationRepository;
import com.skillswap.backend.session.dto.SessionResponse;
import com.skillswap.backend.session.repository.SessionRepository;
import com.skillswap.backend.skill.repository.UserSkillRepository;
import com.skillswap.backend.wallet.service.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private static final int UPCOMING_SESSION_LIMIT = 5;
    private static final int RECENT_ACTIVITY_LIMIT = 8;

    private final MatchRepository matchRepository;
    private final SessionRepository sessionRepository;
    private final UserSkillRepository userSkillRepository;
    private final NotificationRepository notificationRepository;
    private final WalletService walletService;

    @Transactional
    public DashboardResponse getDashboard(Long userId) {
        var stats = new DashboardResponse.Stats(
                matchRepository.countForUser(userId),
                sessionRepository.countForUserByStatus(userId, "Completed"),
                walletService.getOrCreateWallet(userId).getBalance(),
                userSkillRepository.countByUserIdAndType(userId, "offer"),
                userSkillRepository.countByUserIdAndType(userId, "request")
        );

        List<SessionResponse> upcoming = sessionRepository
                .findUpcomingForUser(userId, OffsetDateTime.now(), PageRequest.of(0, UPCOMING_SESSION_LIMIT))
                .stream()
                .map(session -> SessionResponse.from(session, userId))
                .toList();

        List<DashboardResponse.ActivityItem> activity = notificationRepository
                .findByUserIdOrderByIdDesc(userId, PageRequest.of(0, RECENT_ACTIVITY_LIMIT))
                .stream()
                .map(n -> new DashboardResponse.ActivityItem(
                        n.getId(), n.getType(), n.getTitle(), n.getBody(), n.getCreatedAt()))
                .toList();

        return new DashboardResponse(stats, upcoming, activity);
    }
}
