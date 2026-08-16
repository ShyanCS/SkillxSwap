package com.skillswap.backend.availability.service;

import com.skillswap.backend.availability.entity.AvailabilitySlot;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.List;

/**
 * Weekly time ranges projected onto a common UTC timeline so two people's
 * availability can be compared.
 *
 * Slots are stored in each user's own local time, which makes them directly
 * incomparable: "Monday 18:00" means a different instant for someone in Kolkata
 * than for someone in New York. Everything here converts to minutes-from-
 * Monday-00:00 UTC first, which is the only footing on which overlap means
 * anything.
 *
 * Projecting a local weekly pattern into UTC routinely pushes a slot across a
 * day boundary (and across the week boundary for Sunday evenings or Monday
 * mornings), so intervals that run past the end of the week are split and
 * wrapped rather than truncated -- truncating would quietly delete availability
 * for exactly the users furthest from UTC.
 */
final class WeekIntervals {

    static final int MINUTES_PER_WEEK = 7 * 24 * 60;

    private WeekIntervals() {
    }

    /** Half-open [start, end) in minutes from Monday 00:00 UTC. */
    record Interval(int start, int end) {
        int length() {
            return end - start;
        }
    }

    /**
     * @param reference any date; its ISO week supplies the concrete dates used
     *                  to resolve each zone's UTC offset. Using a real week
     *                  rather than an abstract one means the answer reflects
     *                  whatever DST rules are in force then.
     */
    static List<Interval> project(Collection<AvailabilitySlot> slots, ZoneId zone, LocalDate reference) {
        LocalDate monday = reference.minusDays(reference.getDayOfWeek().getValue() - 1L);
        ZonedDateTime weekStartUtc = monday.atStartOfDay(ZoneId.of("UTC"));

        List<Interval> intervals = new ArrayList<>();
        for (AvailabilitySlot slot : slots) {
            LocalDate day = monday.plusDays(slot.getDayOfWeek() - 1L);

            // endMinute may be 1440 (midnight ending the day), which is not a
            // valid LocalTime, so both bounds are built by adding minutes to
            // the start of the day instead of constructing a time directly.
            ZonedDateTime start = localInstant(day, slot.getStartMinute(), zone);
            ZonedDateTime end = localInstant(day, slot.getEndMinute(), zone);

            int startMin = (int) ChronoUnit.MINUTES.between(weekStartUtc, start.withZoneSameInstant(ZoneId.of("UTC")));
            int endMin = (int) ChronoUnit.MINUTES.between(weekStartUtc, end.withZoneSameInstant(ZoneId.of("UTC")));
            if (endMin <= startMin) {
                continue;
            }
            addWrapped(intervals, startMin, endMin);
        }
        return merge(intervals);
    }

    private static ZonedDateTime localInstant(LocalDate day, int minuteOfDay, ZoneId zone) {
        // A DST spring-forward can make the nominal local time non-existent;
        // atZone resolves that forward to a real instant rather than throwing.
        return LocalDateTime.of(day, java.time.LocalTime.MIDNIGHT).plusMinutes(minuteOfDay).atZone(zone);
    }

    /** Normalises into [0, MINUTES_PER_WEEK), splitting anything crossing the boundary. */
    private static void addWrapped(List<Interval> out, int start, int end) {
        int length = end - start;
        int normalizedStart = Math.floorMod(start, MINUTES_PER_WEEK);
        int normalizedEnd = normalizedStart + length;

        if (normalizedEnd <= MINUTES_PER_WEEK) {
            out.add(new Interval(normalizedStart, normalizedEnd));
        } else {
            out.add(new Interval(normalizedStart, MINUTES_PER_WEEK));
            out.add(new Interval(0, normalizedEnd - MINUTES_PER_WEEK));
        }
    }

    /** Sorts and coalesces touching or overlapping intervals. */
    static List<Interval> merge(List<Interval> intervals) {
        if (intervals.isEmpty()) {
            return List.of();
        }
        List<Interval> sorted = new ArrayList<>(intervals);
        sorted.sort(Comparator.comparingInt(Interval::start));

        List<Interval> merged = new ArrayList<>();
        int start = sorted.get(0).start();
        int end = sorted.get(0).end();
        for (Interval next : sorted.subList(1, sorted.size())) {
            if (next.start() <= end) {
                end = Math.max(end, next.end());
            } else {
                merged.add(new Interval(start, end));
                start = next.start();
                end = next.end();
            }
        }
        merged.add(new Interval(start, end));
        return merged;
    }

    /** Total minutes present in both sets. Inputs must be merged. */
    static int overlapMinutes(List<Interval> a, List<Interval> b) {
        int total = 0;
        int i = 0;
        int j = 0;
        while (i < a.size() && j < b.size()) {
            int start = Math.max(a.get(i).start(), b.get(j).start());
            int end = Math.min(a.get(i).end(), b.get(j).end());
            if (end > start) {
                total += end - start;
            }
            // Advance whichever interval ends first; the other may still
            // intersect what comes next.
            if (a.get(i).end() < b.get(j).end()) {
                i++;
            } else {
                j++;
            }
        }
        return total;
    }

    /** True when [start, end) lies entirely inside one merged interval. */
    static boolean covers(List<Interval> merged, int start, int end) {
        for (Interval interval : merged) {
            if (interval.start() <= start && interval.end() >= end) {
                return true;
            }
        }
        return false;
    }
}
