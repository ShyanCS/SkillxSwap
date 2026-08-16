package com.skillswap.backend.common.ratelimit;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;

/**
 * Per-client rate limiting for abuse-prone endpoints.
 *
 * Owns the policy -- which limits exist and how big they are -- and delegates
 * where the counters live to a {@link RateLimitStore}, so single-instance and
 * multi-replica deployments differ only by configuration.
 */
@Service
public class RateLimiterService {

    public enum Limit {
        OTP(Duration.ofHours(1)),
        LOGIN(Duration.ofMinutes(15)),
        AI(Duration.ofHours(1));

        private final Duration window;

        Limit(Duration window) {
            this.window = window;
        }
    }

    private final RateLimitStore store;
    private final int otpPerHour;
    private final int loginPer15Min;
    private final int aiPerHour;

    public RateLimiterService(RateLimitStore store,
                               @Value("${app.ratelimit.otp-per-hour}") int otpPerHour,
                               @Value("${app.ratelimit.login-per-15min}") int loginPer15Min,
                               @Value("${app.ratelimit.ai-per-hour}") int aiPerHour) {
        this.store = store;
        this.otpPerHour = otpPerHour;
        this.loginPer15Min = loginPer15Min;
        this.aiPerHour = aiPerHour;
    }

    public RateLimitDecision check(Limit limit, String clientKey) {
        return store.tryConsume(limit.name() + ':' + clientKey, capacityFor(limit), limit.window);
    }

    private int capacityFor(Limit limit) {
        return switch (limit) {
            case OTP -> otpPerHour;
            case LOGIN -> loginPer15Min;
            case AI -> aiPerHour;
        };
    }
}
