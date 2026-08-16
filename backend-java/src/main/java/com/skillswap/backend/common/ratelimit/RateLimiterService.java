package com.skillswap.backend.common.ratelimit;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;

/**
 * Per-client rate limiting for abuse-prone endpoints.
 *
 * Buckets live in a bounded, self-expiring cache so a flood of unique source
 * IPs can't grow memory without limit -- an idle bucket is evicted, and a
 * caller who returns after eviction simply starts with a full bucket, which is
 * the same state they would have refilled to anyway.
 *
 * NOTE: this is per-instance. Running multiple backend replicas multiplies the
 * effective limit by the replica count. Move the buckets to Redis before
 * scaling horizontally.
 */
@Service
public class RateLimiterService {

    public enum Limit { OTP, LOGIN, AI }

    private static final int MAX_TRACKED_CLIENTS = 100_000;

    private final Cache<String, TokenBucket> buckets = Caffeine.newBuilder()
            .maximumSize(MAX_TRACKED_CLIENTS)
            .expireAfterAccess(Duration.ofHours(2))
            .build();

    private final int otpPerHour;
    private final int loginPer15Min;
    private final int aiPerHour;

    public RateLimiterService(@Value("${app.ratelimit.otp-per-hour}") int otpPerHour,
                               @Value("${app.ratelimit.login-per-15min}") int loginPer15Min,
                               @Value("${app.ratelimit.ai-per-hour}") int aiPerHour) {
        this.otpPerHour = otpPerHour;
        this.loginPer15Min = loginPer15Min;
        this.aiPerHour = aiPerHour;
    }

    public boolean tryConsume(Limit limit, String clientKey) {
        return bucketFor(limit, clientKey).tryConsume();
    }

    public long retryAfterSeconds(Limit limit, String clientKey) {
        return bucketFor(limit, clientKey).retryAfterSeconds();
    }

    private TokenBucket bucketFor(Limit limit, String clientKey) {
        return buckets.get(limit.name() + ':' + clientKey, key -> switch (limit) {
            case OTP -> new TokenBucket(otpPerHour, Duration.ofHours(1));
            case LOGIN -> new TokenBucket(loginPer15Min, Duration.ofMinutes(15));
            case AI -> new TokenBucket(aiPerHour, Duration.ofHours(1));
        });
    }
}
