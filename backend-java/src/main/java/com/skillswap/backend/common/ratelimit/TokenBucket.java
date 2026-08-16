package com.skillswap.backend.common.ratelimit;

import java.time.Duration;

/**
 * A single token bucket: {@code capacity} tokens that refill smoothly over
 * {@code refillPeriod}. Smooth refill (rather than a fixed window) avoids the
 * burst-at-boundary problem where a caller can spend a full window's quota at
 * the end of one window and again at the start of the next.
 *
 * Access is synchronized; contention is per-key (per client IP) and each
 * operation is a few arithmetic ops, so this is not a meaningful bottleneck.
 */
final class TokenBucket {

    private final double capacity;
    private final long refillPeriodNanos;

    private double tokens;
    private long lastRefillNanos;

    TokenBucket(int capacity, Duration refillPeriod) {
        this.capacity = capacity;
        this.refillPeriodNanos = refillPeriod.toNanos();
        this.tokens = capacity;
        this.lastRefillNanos = System.nanoTime();
    }

    /** @return true if a token was consumed; false if the caller is over the limit. */
    synchronized boolean tryConsume() {
        refill();
        if (tokens >= 1.0d) {
            tokens -= 1.0d;
            return true;
        }
        return false;
    }

    /** Seconds until at least one token is available. Always >= 1 so clients don't hot-loop. */
    synchronized long retryAfterSeconds() {
        refill();
        if (tokens >= 1.0d) {
            return 0L;
        }
        double tokensNeeded = 1.0d - tokens;
        double nanosPerToken = refillPeriodNanos / capacity;
        return Math.max(1L, (long) Math.ceil(tokensNeeded * nanosPerToken / 1_000_000_000d));
    }

    private void refill() {
        long now = System.nanoTime();
        long elapsed = now - lastRefillNanos;
        if (elapsed <= 0) {
            return;
        }
        double refilled = ((double) elapsed / refillPeriodNanos) * capacity;
        if (refilled > 0) {
            tokens = Math.min(capacity, tokens + refilled);
            lastRefillNanos = now;
        }
    }
}
