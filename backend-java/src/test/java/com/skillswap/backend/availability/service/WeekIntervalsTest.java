package com.skillswap.backend.availability.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.skillswap.backend.availability.entity.AvailabilitySlot;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/**
 * The timezone projection is the part of availability most likely to be
 * quietly wrong: it is invisible in single-timezone testing and only misbehaves
 * for users far from UTC or near a week boundary.
 *
 * A fixed January reference week keeps these deterministic -- with a floating
 * "now" the northern-hemisphere DST transition would silently change the
 * expected overlaps twice a year.
 */
class WeekIntervalsTest {

    /** 2026-01-12 is a Monday, and every zone used here is on standard time. */
    private static final LocalDate WINTER_WEEK = LocalDate.of(2026, 1, 12);

    private static AvailabilitySlot slot(int day, int startHour, int startMin, int endHour, int endMin) {
        return AvailabilitySlot.builder()
                .dayOfWeek((short) day)
                .startMinute((short) (startHour * 60 + startMin))
                .endMinute((short) (endHour * 60 + endMin))
                .build();
    }

    @Test
    @DisplayName("a UTC slot maps to the same minutes it was declared in")
    void utcSlotIsUnchanged() {
        List<WeekIntervals.Interval> projected =
                WeekIntervals.project(List.of(slot(1, 9, 0, 11, 0)), ZoneId.of("UTC"), WINTER_WEEK);

        assertThat(projected).containsExactly(new WeekIntervals.Interval(540, 660));
    }

    @Test
    @DisplayName("a slot east of UTC shifts earlier on the UTC timeline")
    void slotAheadOfUtcShiftsBack() {
        // Kolkata is UTC+5:30, so Monday 18:00 local is Monday 12:30 UTC.
        List<WeekIntervals.Interval> projected =
                WeekIntervals.project(List.of(slot(1, 18, 0, 20, 0)), ZoneId.of("Asia/Kolkata"), WINTER_WEEK);

        assertThat(projected).containsExactly(new WeekIntervals.Interval(12 * 60 + 30, 14 * 60 + 30));
    }

    @Test
    @DisplayName("two people in different timezones overlap by the real shared time")
    void crossTimezoneOverlapIsComputedOnRealInstants() {
        // Kolkata Mon 18:00-20:00 -> 12:30-14:30 UTC
        // New York Mon 09:00-11:00 EST -> 14:00-16:00 UTC
        // Shared: 14:00-14:30 == 30 minutes.
        List<WeekIntervals.Interval> kolkata =
                WeekIntervals.project(List.of(slot(1, 18, 0, 20, 0)), ZoneId.of("Asia/Kolkata"), WINTER_WEEK);
        List<WeekIntervals.Interval> newYork =
                WeekIntervals.project(List.of(slot(1, 9, 0, 11, 0)), ZoneId.of("America/New_York"), WINTER_WEEK);

        assertThat(WeekIntervals.overlapMinutes(kolkata, newYork)).isEqualTo(30);
    }

    @Test
    @DisplayName("identical local hours in distant timezones do not overlap at all")
    void sameLocalHoursDifferentZonesDoNotOverlap() {
        // The naive implementation -- comparing stored minutes directly -- would
        // report a full two-hour overlap here. They share no real time at all.
        List<WeekIntervals.Interval> kolkata =
                WeekIntervals.project(List.of(slot(1, 9, 0, 11, 0)), ZoneId.of("Asia/Kolkata"), WINTER_WEEK);
        List<WeekIntervals.Interval> newYork =
                WeekIntervals.project(List.of(slot(1, 9, 0, 11, 0)), ZoneId.of("America/New_York"), WINTER_WEEK);

        assertThat(WeekIntervals.overlapMinutes(kolkata, newYork)).isZero();
    }

    @Test
    @DisplayName("a slot pushed past Sunday midnight UTC wraps to the start of the week")
    void slotCrossingWeekEndIsSplitNotTruncated() {
        // Los Angeles is UTC-8: Sunday 15:00-18:00 local is Sunday 23:00 UTC
        // through Monday 02:00 UTC, i.e. past the end of the week.
        List<WeekIntervals.Interval> projected =
                WeekIntervals.project(List.of(slot(7, 15, 0, 18, 0)), ZoneId.of("America/Los_Angeles"), WINTER_WEEK);

        assertThat(projected)
                .containsExactly(
                        new WeekIntervals.Interval(0, 120),
                        new WeekIntervals.Interval(10020, WeekIntervals.MINUTES_PER_WEEK));
        // Nothing is lost to the wrap: still three hours in total.
        assertThat(projected.stream().mapToInt(WeekIntervals.Interval::length).sum())
                .isEqualTo(180);
    }

    @Test
    @DisplayName("a slot before Monday 00:00 UTC wraps to the end of the week")
    void slotBeforeWeekStartWraps() {
        // Kolkata Monday 00:00-02:00 local is Sunday 18:30-20:30 UTC.
        List<WeekIntervals.Interval> projected =
                WeekIntervals.project(List.of(slot(1, 0, 0, 2, 0)), ZoneId.of("Asia/Kolkata"), WINTER_WEEK);

        int sundayEighteenThirty = 6 * 1440 + 18 * 60 + 30;
        assertThat(projected)
                .containsExactly(new WeekIntervals.Interval(sundayEighteenThirty, sundayEighteenThirty + 120));
    }

    @Test
    @DisplayName("adjacent and overlapping slots are coalesced")
    void adjacentSlotsMerge() {
        List<WeekIntervals.Interval> projected = WeekIntervals.project(
                List.of(slot(1, 9, 0, 11, 0), slot(1, 11, 0, 13, 0), slot(1, 10, 0, 12, 0)),
                ZoneId.of("UTC"),
                WINTER_WEEK);

        assertThat(projected).containsExactly(new WeekIntervals.Interval(540, 780));
    }

    @Test
    @DisplayName("coverage requires the whole range, not just its start")
    void coverageRequiresTheEntireRange() {
        List<WeekIntervals.Interval> available =
                WeekIntervals.project(List.of(slot(1, 9, 0, 11, 0)), ZoneId.of("UTC"), WINTER_WEEK);

        assertThat(WeekIntervals.covers(available, 540, 600)).isTrue(); // 09:00-10:00
        assertThat(WeekIntervals.covers(available, 540, 660)).isTrue(); // exactly the slot
        // Starts inside the window but runs past its end -- a check that only
        // looked at the start time would wrongly allow this.
        assertThat(WeekIntervals.covers(available, 600, 720)).isFalse();
        assertThat(WeekIntervals.covers(available, 400, 500)).isFalse();
    }

    @Test
    @DisplayName("overlap across many disjoint slots is summed correctly")
    void overlapAccumulatesAcrossSlots() {
        List<WeekIntervals.Interval> a = WeekIntervals.project(
                List.of(slot(1, 9, 0, 12, 0), slot(3, 9, 0, 12, 0)), ZoneId.of("UTC"), WINTER_WEEK);
        List<WeekIntervals.Interval> b = WeekIntervals.project(
                List.of(slot(1, 11, 0, 13, 0), slot(3, 8, 0, 10, 0), slot(5, 9, 0, 12, 0)),
                ZoneId.of("UTC"),
                WINTER_WEEK);

        // Monday 11:00-12:00 (60) + Wednesday 09:00-10:00 (60); Friday shares nothing.
        assertThat(WeekIntervals.overlapMinutes(a, b)).isEqualTo(120);
    }
}
