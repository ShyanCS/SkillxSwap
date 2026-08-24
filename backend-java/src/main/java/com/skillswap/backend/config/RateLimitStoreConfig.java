package com.skillswap.backend.config;

import com.skillswap.backend.common.ratelimit.InMemoryRateLimitStore;
import com.skillswap.backend.common.ratelimit.RateLimitStore;
import com.skillswap.backend.common.ratelimit.RedisRateLimitStore;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.data.redis.core.script.RedisScript;
import org.springframework.scripting.support.ResourceScriptSource;

/**
 * Chooses where rate-limit counters live.
 *
 * Redis is opt-in rather than required: a single-instance deployment is a
 * legitimate way to run this app, and forcing an extra piece of infrastructure
 * on it would buy nothing. Turning REDIS_ENABLED on is what a horizontally
 * scaled deployment needs -- without it, each replica keeps its own buckets and
 * the effective limit multiplies by the replica count.
 */
@Slf4j
@Configuration
public class RateLimitStoreConfig {

    @Bean
    @ConditionalOnProperty(name = "app.redis.enabled", havingValue = "false", matchIfMissing = true)
    public RateLimitStore inMemoryRateLimitStore() {
        log.info("Rate limiting: in-memory (per-instance). Enable Redis before running multiple API replicas.");
        return new InMemoryRateLimitStore();
    }

    @Bean
    @ConditionalOnProperty(name = "app.redis.enabled", havingValue = "true")
    public RateLimitStore redisRateLimitStore(StringRedisTemplate redisTemplate) {
        log.info("Rate limiting: Redis-backed (shared across instances).");
        return new RedisRateLimitStore(redisTemplate, rateLimitScript(), new InMemoryRateLimitStore());
    }

    private RedisScript<List> rateLimitScript() {
        DefaultRedisScript<List> script = new DefaultRedisScript<>();
        script.setScriptSource(new ResourceScriptSource(new ClassPathResource("scripts/rate_limit.lua")));
        script.setResultType(List.class);
        return script;
    }
}
