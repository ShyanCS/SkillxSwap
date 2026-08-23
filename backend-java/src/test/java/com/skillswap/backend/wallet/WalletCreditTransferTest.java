package com.skillswap.backend.wallet;

import static org.assertj.core.api.Assertions.assertThat;

import com.skillswap.backend.IntegrationTestBase;
import com.skillswap.backend.auth.entity.User;
import com.skillswap.backend.auth.repository.UserRepository;
import com.skillswap.backend.matching.entity.Match;
import com.skillswap.backend.matching.entity.MatchRequest;
import com.skillswap.backend.matching.repository.MatchRepository;
import com.skillswap.backend.matching.repository.MatchRequestRepository;
import com.skillswap.backend.session.entity.Session;
import com.skillswap.backend.session.repository.SessionRepository;
import com.skillswap.backend.session.service.SessionService;
import com.skillswap.backend.skill.entity.Skill;
import com.skillswap.backend.skill.repository.SkillRepository;
import com.skillswap.backend.wallet.service.WalletService;
import java.time.OffsetDateTime;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

/**
 * The credit ledger is the closest thing this system has to money, so these
 * cover the invariants that must never break: a completed session moves credits
 * exactly once, and the totals stay balanced.
 */
class WalletCreditTransferTest extends IntegrationTestBase {

    @Autowired
    UserRepository userRepository;

    @Autowired
    SkillRepository skillRepository;

    @Autowired
    MatchRequestRepository matchRequestRepository;

    @Autowired
    MatchRepository matchRepository;

    @Autowired
    SessionRepository sessionRepository;

    @Autowired
    SessionService sessionService;

    @Autowired
    WalletService walletService;

    private static final int STARTER_BALANCE = 5;

    @Test
    @DisplayName("completing a session moves credits from learner to teacher")
    void completingSessionTransfersCredits() {
        User teacher = createUser("teacher@example.com");
        User learner = createUser("learner@example.com");
        Session session = createScheduledSession(teacher, learner, 60);

        sessionService.updateStatus(session.getId(), teacher.getId(), "Completed");

        // 60 minutes => 2 credits (1 per 30 minutes).
        assertThat(walletService.getWallet(teacher.getId()).balance()).isEqualTo(STARTER_BALANCE + 2);
        assertThat(walletService.getWallet(learner.getId()).balance()).isEqualTo(STARTER_BALANCE - 2);
    }

    @Test
    @DisplayName("completing an already-completed session does not credit twice")
    void completingTwiceDoesNotDoubleCredit() {
        User teacher = createUser("teacher2@example.com");
        User learner = createUser("learner2@example.com");
        Session session = createScheduledSession(teacher, learner, 60);

        sessionService.updateStatus(session.getId(), teacher.getId(), "Completed");
        // Both participants can mark a session complete, and the UI can retry;
        // the transfer must be idempotent.
        sessionService.updateStatus(session.getId(), learner.getId(), "Completed");

        assertThat(walletService.getWallet(teacher.getId()).balance()).isEqualTo(STARTER_BALANCE + 2);
        assertThat(walletService.getWallet(learner.getId()).balance()).isEqualTo(STARTER_BALANCE - 2);
    }

    @Test
    @DisplayName("credits are conserved: what the learner spends, the teacher earns")
    void creditsAreConserved() {
        User teacher = createUser("teacher3@example.com");
        User learner = createUser("learner3@example.com");
        Session session = createScheduledSession(teacher, learner, 90);

        sessionService.updateStatus(session.getId(), teacher.getId(), "Completed");

        int teacherBalance = walletService.getWallet(teacher.getId()).balance();
        int learnerBalance = walletService.getWallet(learner.getId()).balance();
        assertThat(teacherBalance + learnerBalance).isEqualTo(STARTER_BALANCE * 2);
    }

    @Test
    @DisplayName("cancelling a session moves no credits")
    void cancellingTransfersNothing() {
        User teacher = createUser("teacher4@example.com");
        User learner = createUser("learner4@example.com");
        Session session = createScheduledSession(teacher, learner, 60);

        sessionService.updateStatus(session.getId(), teacher.getId(), "Cancelled");

        assertThat(walletService.getWallet(teacher.getId()).balance()).isEqualTo(STARTER_BALANCE);
        assertThat(walletService.getWallet(learner.getId()).balance()).isEqualTo(STARTER_BALANCE);
    }

    // ---------- fixtures ----------

    private User createUser(String email) {
        return userRepository.save(User.builder()
                .name(email.split("@")[0])
                .email(email)
                .passwordHash("irrelevant-for-these-tests")
                .build());
    }

    private Session createScheduledSession(User teacher, User learner, int minutes) {
        MatchRequest request = matchRequestRepository.save(MatchRequest.builder()
                .sender(teacher)
                .receiver(learner)
                .status("Accepted")
                .build());

        Match match = matchRepository.save(Match.builder()
                .matchRequest(request)
                .user1(teacher)
                .user2(learner)
                .build());

        // The seeded catalog (migration V6) survives the per-test truncation.
        Skill skill = skillRepository.findAll().get(0);

        return sessionRepository.save(Session.builder()
                .match(match)
                .skill(skill)
                .teacher(teacher)
                .learner(learner)
                .scheduledAt(OffsetDateTime.now().plusDays(1))
                .durationMinutes(minutes)
                .sessionType("online")
                .status("Scheduled")
                .build());
    }
}
