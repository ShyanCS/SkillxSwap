package com.skillswap.backend.session;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.skillswap.backend.IntegrationTestBase;
import com.skillswap.backend.auth.entity.User;
import com.skillswap.backend.auth.repository.UserRepository;
import com.skillswap.backend.availability.dto.AvailabilityDtos.SlotDto;
import com.skillswap.backend.availability.service.AvailabilityService;
import com.skillswap.backend.common.exception.ApiException;
import com.skillswap.backend.matching.entity.Match;
import com.skillswap.backend.matching.entity.MatchRequest;
import com.skillswap.backend.matching.repository.MatchRepository;
import com.skillswap.backend.matching.repository.MatchRequestRepository;
import com.skillswap.backend.session.dto.CreateSessionRequest;
import com.skillswap.backend.session.service.SessionService;
import com.skillswap.backend.skill.entity.Skill;
import com.skillswap.backend.skill.entity.UserSkill;
import com.skillswap.backend.skill.repository.SkillRepository;
import com.skillswap.backend.skill.repository.UserSkillRepository;
import java.time.DayOfWeek;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

/**
 * Scheduling has two independent guards -- declared availability (when someone
 * is willing) and existing bookings (when they are already committed) -- and
 * either one missing lets the same hour be sold twice.
 */
class SchedulingRulesTest extends IntegrationTestBase {

    @Autowired
    UserRepository userRepository;

    @Autowired
    SkillRepository skillRepository;

    @Autowired
    UserSkillRepository userSkillRepository;

    @Autowired
    MatchRequestRepository matchRequestRepository;

    @Autowired
    MatchRepository matchRepository;

    @Autowired
    SessionService sessionService;

    @Autowired
    AvailabilityService availabilityService;

    /** Next Wednesday at the given UTC hour, so tests never land in the past. */
    private OffsetDateTime nextWednesdayAt(int hourUtc) {
        return ZonedDateTime.now(ZoneId.of("UTC"))
                .with(TemporalAdjusters.next(DayOfWeek.WEDNESDAY))
                .withHour(hourUtc)
                .withMinute(0)
                .withSecond(0)
                .withNano(0)
                .toOffsetDateTime();
    }

    @Test
    @DisplayName("a user who has declared nothing can still be scheduled")
    void noDeclaredAvailabilityMeansNoRestriction() {
        User teacher = createUser("open-teacher@example.com", "UTC");
        User learner = createUser("open-learner@example.com", "UTC");
        Match match = createMatch(teacher, learner);
        Skill skill = offerSkill(teacher);

        assertThatCode(() -> sessionService.createSession(
                        teacher.getId(), request(match, teacher, skill, nextWednesdayAt(10), 60)))
                .doesNotThrowAnyException();
    }

    @Test
    @DisplayName("scheduling outside a declared window is rejected")
    void outsideDeclaredAvailabilityIsRejected() {
        User teacher = createUser("busy-teacher@example.com", "UTC");
        User learner = createUser("busy-learner@example.com", "UTC");
        // Wednesday 09:00-12:00 UTC only.
        availabilityService.replaceAvailability(
                teacher.getId(), List.of(new SlotDto((short) 3, (short) (9 * 60), (short) (12 * 60))));

        Match match = createMatch(teacher, learner);
        Skill skill = offerSkill(teacher);

        assertThatThrownBy(() -> sessionService.createSession(
                        teacher.getId(), request(match, teacher, skill, nextWednesdayAt(15), 60)))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("not available");
    }

    @Test
    @DisplayName("a session that starts inside a window but overruns it is rejected")
    void sessionOverrunningTheWindowIsRejected() {
        User teacher = createUser("overrun-teacher@example.com", "UTC");
        User learner = createUser("overrun-learner@example.com", "UTC");
        // Wednesday 09:00-10:00 UTC: a 120-minute session starting at 09:00 runs past it.
        availabilityService.replaceAvailability(
                teacher.getId(), List.of(new SlotDto((short) 3, (short) (9 * 60), (short) (10 * 60))));

        Match match = createMatch(teacher, learner);
        Skill skill = offerSkill(teacher);

        assertThatThrownBy(() -> sessionService.createSession(
                        teacher.getId(), request(match, teacher, skill, nextWednesdayAt(9), 120)))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("not available");
    }

    @Test
    @DisplayName("availability declared in a non-UTC timezone is honoured as real time")
    void availabilityIsInterpretedInTheUsersOwnTimezone() {
        // Kolkata is UTC+5:30, so 18:00-20:00 local is 12:30-14:30 UTC.
        User teacher = createUser("kolkata@example.com", "Asia/Kolkata");
        User learner = createUser("kolkata-learner@example.com", "UTC");
        availabilityService.replaceAvailability(
                teacher.getId(), List.of(new SlotDto((short) 3, (short) (18 * 60), (short) (20 * 60))));

        Match match = createMatch(teacher, learner);
        Skill skill = offerSkill(teacher);

        // 13:00 UTC == 18:30 Kolkata: inside the window.
        assertThatCode(() -> sessionService.createSession(
                        teacher.getId(), request(match, teacher, skill, nextWednesdayAt(13), 60)))
                .doesNotThrowAnyException();

        // 18:00 UTC == 23:30 Kolkata: outside it. Reading the stored minutes
        // literally, without converting, would wrongly accept this.
        assertThatThrownBy(() -> sessionService.createSession(
                        teacher.getId(), request(match, teacher, skill, nextWednesdayAt(18), 60)))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("not available");
    }

    @Test
    @DisplayName("a second session overlapping an existing booking is rejected")
    void doubleBookingIsRejected() {
        User teacher = createUser("clash-teacher@example.com", "UTC");
        User learner = createUser("clash-learner@example.com", "UTC");
        Match match = createMatch(teacher, learner);
        Skill skill = offerSkill(teacher);

        sessionService.createSession(teacher.getId(), request(match, teacher, skill, nextWednesdayAt(10), 60));

        // Starts 30 minutes into the existing session.
        assertThatThrownBy(() -> sessionService.createSession(
                        teacher.getId(),
                        request(match, teacher, skill, nextWednesdayAt(10).plusMinutes(30), 60)))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("already has a session");
    }

    @Test
    @DisplayName("an earlier long session that runs into the new slot is detected")
    void earlierOverrunningSessionIsDetected() {
        User teacher = createUser("long-teacher@example.com", "UTC");
        User learner = createUser("long-learner@example.com", "UTC");
        Match match = createMatch(teacher, learner);
        Skill skill = offerSkill(teacher);

        // 09:00 + 180 minutes runs to 12:00.
        sessionService.createSession(teacher.getId(), request(match, teacher, skill, nextWednesdayAt(9), 180));

        // A query anchored only at the new slot's start would miss this.
        assertThatThrownBy(() -> sessionService.createSession(
                        teacher.getId(), request(match, teacher, skill, nextWednesdayAt(11), 60)))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("already has a session");
    }

    @Test
    @DisplayName("back-to-back sessions are allowed")
    void adjacentSessionsAreAllowed() {
        User teacher = createUser("adjacent-teacher@example.com", "UTC");
        User learner = createUser("adjacent-learner@example.com", "UTC");
        Match match = createMatch(teacher, learner);
        Skill skill = offerSkill(teacher);

        sessionService.createSession(teacher.getId(), request(match, teacher, skill, nextWednesdayAt(10), 60));

        // Starts exactly when the previous one ends -- touching, not overlapping.
        assertThatCode(() -> sessionService.createSession(
                        teacher.getId(), request(match, teacher, skill, nextWednesdayAt(11), 60)))
                .doesNotThrowAnyException();
    }

    @Test
    @DisplayName("sessions cannot be scheduled in the past")
    void pastSessionsAreRejected() {
        User teacher = createUser("past-teacher@example.com", "UTC");
        User learner = createUser("past-learner@example.com", "UTC");
        Match match = createMatch(teacher, learner);
        Skill skill = offerSkill(teacher);

        assertThatThrownBy(() -> sessionService.createSession(
                        teacher.getId(),
                        request(match, teacher, skill, OffsetDateTime.now().minusDays(2), 60)))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("past");
    }

    @Test
    @DisplayName("availability round-trips through the API in the user's timezone")
    void availabilityRoundTrips() {
        User user = createUser("roundtrip@example.com", "Asia/Kolkata");
        availabilityService.replaceAvailability(
                user.getId(),
                List.of(new SlotDto((short) 1, (short) 540, (short) 660), new SlotDto((short) 5, (short) 1080, (short)
                        1440)));

        var response = availabilityService.getAvailability(user.getId());
        assertThat(response.timezone()).isEqualTo("Asia/Kolkata");
        assertThat(response.slots()).hasSize(2);
        // Replacing wholesale must not accumulate rows.
        availabilityService.replaceAvailability(
                user.getId(), List.of(new SlotDto((short) 2, (short) 600, (short) 700)));
        assertThat(availabilityService.getAvailability(user.getId()).slots()).hasSize(1);
    }

    // ---------- fixtures ----------

    private User createUser(String email, String timezone) {
        return userRepository.save(User.builder()
                .name(email.split("@")[0])
                .email(email)
                .passwordHash("irrelevant-for-these-tests")
                .timezone(timezone)
                .build());
    }

    private Match createMatch(User teacher, User learner) {
        MatchRequest request = matchRequestRepository.save(MatchRequest.builder()
                .sender(teacher)
                .receiver(learner)
                .status("Accepted")
                .build());
        return matchRepository.save(Match.builder()
                .matchRequest(request)
                .user1(teacher)
                .user2(learner)
                .build());
    }

    /** The seeded catalog (migration V6) survives the per-test truncation. */
    private Skill offerSkill(User teacher) {
        Skill skill = skillRepository.findAll().get(0);
        userSkillRepository.save(UserSkill.builder()
                .user(teacher)
                .skill(skill)
                .type("offer")
                .description("test offer")
                .build());
        return skill;
    }

    private CreateSessionRequest request(Match match, User teacher, Skill skill, OffsetDateTime at, int minutes) {
        return new CreateSessionRequest(
                match.getId(), skill.getId(), teacher.getId(), at, minutes, "online", null, null);
    }
}
