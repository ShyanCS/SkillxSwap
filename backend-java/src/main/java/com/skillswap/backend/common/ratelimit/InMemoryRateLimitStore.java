package com.skillswap.backend.common.ratelimit;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import java.time.Duration;

/**
 * Process-local buckets.
 *
 * Correct for a single API instance, and the fallback when Redis is disabled or
 * unreachable. Running several replicas on this store multiplies the effective
 * limit by the replica count, since each holds its own independent buckets.
 *
 * The cache is bounded and self-expiring so a flood of unique source IPs can't
 * grow memory without limit -- an idle bucket is evicted, and a caller who
 * returns after eviction simply starts full, which is the state they would have
 * refilled to anyway.
 */
public class InMemoryRateLimitStore implements RateLimitStore {

    private static final int MAX_TRACKED_CLIENTS = 100_000;

    private final Cache<String, TokenBucket> buckets = Caffeine.newBuilder()
            .maximumSize(MAX_TRACKED_CLIENTS)
            .expireAfterAccess(Duration.ofHours(2))
            .build();

    @Override
    public RateLimitDecision tryConsume(String key, int capacity, Duration refillPeriod) {
        return buckets.get(key, k -> new TokenBucket(capacity, refillPeriod)).tryConsume();
    }
}
