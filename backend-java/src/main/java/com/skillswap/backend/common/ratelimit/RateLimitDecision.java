package com.skillswap.backend.common.ratelimit;

/**
 * Outcome of a single rate-limit check.
 *
 * Allowance and retry-after come back together rather than from two separate
 * calls: against a shared store those would be two round-trips reading state
 * that can change in between, so the advertised Retry-After could disagree with
 * the decision that produced it.
 */
public record RateLimitDecision(boolean allowed, long retryAfterSeconds) {

    private static final RateLimitDecision ALLOWED = new RateLimitDecision(true, 0L);

    public static RateLimitDecision allow() {
        return ALLOWED;
    }

    public static RateLimitDecision deny(long retryAfterSeconds) {
        return new RateLimitDecision(false, Math.max(1L, retryAfterSeconds));
    }
}
