package com.skillswap.backend.availability.service;

import com.skillswap.backend.auth.entity.User;
import com.skillswap.backend.auth.repository.UserRepository;
import com.skillswap.backend.availability.dto.AvailabilityDtos.AvailabilityResponse;
import com.skillswap.backend.availability.dto.AvailabilityDtos.SlotDto;
import com.skillswap.backend.availability.entity.AvailabilitySlot;
import com.skillswap.backend.availability.repository.AvailabilityRepository;
import com.skillswap.backend.common.exception.ApiException;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AvailabilityService {

    private static final ZoneId UTC = ZoneId.of("UTC");

    private final AvailabilityRepository availabilityRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public AvailabilityResponse getAvailability(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> ApiException.notFound("User not found"));
        List<SlotDto> slots = availabilityRepository.findByUserIdOrderByDayOfWeekAscStartMinuteAsc(userId).stream()
                .map(SlotDto::from)
                .toList();
        return new AvailabilityResponse(zoneIdOf(user).getId(), slots);
    }

    @Transactional
    public AvailabilityResponse replaceAvailability(Long userId, List<SlotDto> slots) {
        for (SlotDto slot : slots) {
            if (slot.endMinute() <= slot.startMinute()) {
                throw ApiException.badRequest("A slot's end time must be after its start time.");
            }
        }
        User user = userRepository.findById(userId).orElseThrow(() -> ApiException.notFound("User not found"));

        // Delete-then-insert: the editor submits the whole week, and diffing
        // against existing rows would add complexity with no observable gain.
        availabilityRepository.deleteByUserId(userId);
        availabilityRepository.flush();

        availabilityRepository.saveAll(slots.stream()
                .map(slot -> AvailabilitySlot.builder()
                        .user(user)
                        .dayOfWeek(slot.dayOfWeek())
                        .startMinute(slot.startMinute())
                        .endMinute(slot.endMinute())
                        .build())
                .toList());

        return getAvailability(userId);
    }

    /**
     * Whether a user's declared availability covers a concrete session.
     *
     * A user who has declared nothing is treated as available: the feature is
     * opt-in, and defaulting the other way would lock every existing account
     * out of scheduling the moment this shipped.
     */
    @Transactional(readOnly = true)
    public boolean isAvailableFor(User user, OffsetDateTime startsAt, int durationMinutes) {
        List<AvailabilitySlot> slots =
                availabilityRepository.findByUserIdOrderByDayOfWeekAscStartMinuteAsc(user.getId());
        if (slots.isEmpty()) {
            return true;
        }
        return covers(slots, zoneIdOf(user), startsAt, durationMinutes);
    }

    private boolean covers(
            Collection<AvailabilitySlot> slots, ZoneId zone, OffsetDateTime startsAt, int durationMinutes) {
        LocalDate reference = startsAt.atZoneSameInstant(zone).toLocalDate();
        List<WeekIntervals.Interval> available = WeekIntervals.project(slots, zone, reference);

        ZonedDateTime weekStartUtc =
                reference.minusDays(reference.getDayOfWeek().getValue() - 1L).atStartOfDay(UTC);
        int start = Math.floorMod(
                (int) ChronoUnit.MINUTES.between(weekStartUtc, startsAt.atZoneSameInstant(UTC)),
                WeekIntervals.MINUTES_PER_WEEK);
        int end = start + durationMinutes;

        // A session running past Sunday midnight UTC continues at the start of
        // the week, so it has to be checked as two pieces.
        if (end > WeekIntervals.MINUTES_PER_WEEK) {
            return WeekIntervals.covers(available, start, WeekIntervals.MINUTES_PER_WEEK)
                    && WeekIntervals.covers(available, 0, end - WeekIntervals.MINUTES_PER_WEEK);
        }
        return WeekIntervals.covers(available, start, end);
    }

    /**
     * Minutes per week both users are free, used to rank matches. Zero when
     * either side has declared nothing, which the caller treats as "unknown"
     * rather than "incompatible".
     */
    @Transactional(readOnly = true)
    public Map<Long, Integer> weeklyOverlapMinutes(User viewer, Collection<User> candidates) {
        List<AvailabilitySlot> mine =
                availabilityRepository.findByUserIdOrderByDayOfWeekAscStartMinuteAsc(viewer.getId());
        if (mine.isEmpty() || candidates.isEmpty()) {
            return Map.of();
        }

        LocalDate reference = LocalDate.now(UTC);
        List<WeekIntervals.Interval> myIntervals = WeekIntervals.project(mine, zoneIdOf(viewer), reference);

        // One query for every candidate rather than one per candidate.
        Map<Long, List<AvailabilitySlot>> byUser =
                availabilityRepository
                        .findByUserIdIn(candidates.stream().map(User::getId).toList())
                        .stream()
                        .collect(Collectors.groupingBy(slot -> slot.getUser().getId()));

        return candidates.stream()
                .filter(candidate -> byUser.containsKey(candidate.getId()))
                .collect(Collectors.toMap(
                        User::getId,
                        candidate -> WeekIntervals.overlapMinutes(
                                myIntervals,
                                WeekIntervals.project(byUser.get(candidate.getId()), zoneIdOf(candidate), reference))));
    }

    /**
     * users.timezone is free text supplied at profile setup, so an unrecognised
     * value must not blow up scheduling for everyone involved.
     */
    private ZoneId zoneIdOf(User user) {
        String timezone = user.getTimezone();
        if (timezone == null || timezone.isBlank()) {
            return UTC;
        }
        try {
            return ZoneId.of(timezone.trim());
        } catch (Exception e) {
            log.debug("User {} has an unrecognised timezone '{}'; treating as UTC", user.getId(), timezone);
            return UTC;
        }
    }
}
