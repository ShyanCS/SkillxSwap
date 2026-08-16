package com.skillswap.backend.common.ratelimit;

import java.time.Duration;

/**
 * Where token buckets live. Swapping the implementation is what decides whether
 * limits are enforced per API instance or across the whole deployment.
 */
public interface RateLimitStore {

    /**
     * Attempts to spend one token from {@code key}'s bucket.
     *
     * @param capacity     tokens available per refill period
     * @param refillPeriod time to refill from empty to full
     */
    RateLimitDecision tryConsume(String key, int capacity, Duration refillPeriod);
}
