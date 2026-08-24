package com.skillswap.backend.common.ratelimit;

import java.time.Duration;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.RedisScript;

/**
 * Buckets shared by every API instance, so a limit of 5/hour means 5/hour for
 * the deployment rather than 5/hour per replica.
 *
 * When Redis is unreachable this degrades to the in-process store instead of
 * failing either way outright: failing closed would turn a cache outage into a
 * full authentication outage, while failing open would drop brute-force
 * protection at exactly the moment infrastructure is already unhealthy.
 * Per-instance limiting is the useful middle -- weaker than intended, far from
 * absent.
 */
@Slf4j
public class RedisRateLimitStore implements RateLimitStore {

    private final StringRedisTemplate redis;
    private final RedisScript<List> script;
    private final RateLimitStore fallback;

    /** Rate-limits every log line about an outage down to one per interval. */
    private static final long OUTAGE_LOG_INTERVAL_MILLIS = 30_000L;

    private volatile long lastOutageLogAt = 0L;

    public RedisRateLimitStore(StringRedisTemplate redis, RedisScript<List> script, RateLimitStore fallback) {
        this.redis = redis;
        this.script = script;
        this.fallback = fallback;
    }

    @Override
    @SuppressWarnings("unchecked")
    public RateLimitDecision tryConsume(String key, int capacity, Duration refillPeriod) {
        try {
            List<Long> result = redis.execute(
                    script,
                    List.of("ratelimit:" + key),
                    String.valueOf(capacity),
                    String.valueOf(refillPeriod.toMillis()));

            if (result == null || result.size() < 2) {
                return degrade(key, capacity, refillPeriod, new IllegalStateException("malformed script result"));
            }
            boolean allowed = result.get(0) != null && result.get(0) == 1L;
            return allowed ? RateLimitDecision.allow() : RateLimitDecision.deny(result.get(1));
        } catch (Exception e) {
            return degrade(key, capacity, refillPeriod, e);
        }
    }

    private RateLimitDecision degrade(String key, int capacity, Duration refillPeriod, Exception cause) {
        long now = System.currentTimeMillis();
        if (now - lastOutageLogAt > OUTAGE_LOG_INTERVAL_MILLIS) {
            lastOutageLogAt = now;
            log.error("Redis rate limiting unavailable, falling back to per-instance limits: {}", cause.toString());
        }
        return fallback.tryConsume(key, capacity, refillPeriod);
    }
}
