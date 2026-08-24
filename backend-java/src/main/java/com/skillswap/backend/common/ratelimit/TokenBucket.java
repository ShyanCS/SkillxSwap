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

    /**
     * Consumes a token if one is available, reporting the wait when it is not.
     * Both answers come from one synchronized section so the Retry-After can't
     * be computed against a bucket another thread has since refilled or drained.
     */
    synchronized RateLimitDecision tryConsume() {
        refill();
        if (tokens >= 1.0d) {
            tokens -= 1.0d;
            return RateLimitDecision.allow();
        }
        double tokensNeeded = 1.0d - tokens;
        double nanosPerToken = refillPeriodNanos / capacity;
        long retryAfter = (long) Math.ceil(tokensNeeded * nanosPerToken / 1_000_000_000d);
        return RateLimitDecision.deny(retryAfter);
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
