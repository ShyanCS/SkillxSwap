package com.skillswap.backend.config;

import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.config.BeanFactoryPostProcessor;
import org.springframework.beans.factory.config.ConfigurableListableBeanFactory;
import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

/**
 * Refuses to start the application if production is misconfigured in a way that
 * would be insecure but otherwise silent -- a weak signing key, a leftover dev
 * key, or a CORS policy that trusts everything.
 *
 * Implemented as a {@link BeanFactoryPostProcessor} so it runs before any
 * singleton is instantiated. An ordinary {@code @PostConstruct} check runs too
 * late to be trustworthy here: the DataSource and Flyway initialise first, so
 * on a healthy database the app could get most of the way up before anyone
 * noticed the signing key was a development placeholder.
 *
 * These are deliberately hard failures: a service that won't boot is a far
 * better outcome than one that boots and quietly accepts forged tokens.
 */
@Component
@Profile("prod")
public class ProductionConfigValidator implements BeanFactoryPostProcessor {

    private static final Logger log = LoggerFactory.getLogger(ProductionConfigValidator.class);

    /** HS256 needs 256 bits; require that as an absolute floor. */
    private static final int MIN_SECRET_BYTES = 32;

    @Override
    public void postProcessBeanFactory(ConfigurableListableBeanFactory beanFactory) {
        Environment env = beanFactory.getBean(Environment.class);

        validateJwtSecret(env.getProperty("app.jwt.secret", ""));
        validateCors(env.getProperty("app.cors.allowed-origins", ""));
        validateAi(
                Boolean.parseBoolean(env.getProperty("app.ai.enabled", "false")),
                env.getProperty("app.ai.api-key", ""));
        validateRedis(
                Boolean.parseBoolean(env.getProperty("app.redis.enabled", "false")),
                env.getProperty("spring.data.redis.password", ""));

        log.info("Production configuration validated");
    }

    private void validateJwtSecret(String secret) {
        int bytes = secret.getBytes(StandardCharsets.UTF_8).length;
        if (bytes < MIN_SECRET_BYTES) {
            throw new IllegalStateException("JWT_SECRET is too short (" + bytes + " bytes). Use at least "
                    + MIN_SECRET_BYTES + " bytes of random data, e.g. `openssl rand -base64 48`.");
        }
        if (secret.contains("dev-only") || secret.contains("change-me") || secret.contains("insecure")) {
            throw new IllegalStateException(
                    "JWT_SECRET still contains a development placeholder value. Generate a real secret "
                            + "with `openssl rand -base64 48`.");
        }
    }

    private void validateCors(String rawOrigins) {
        if (rawOrigins.isBlank()) {
            throw new IllegalStateException("CORS_ALLOWED_ORIGINS must list your frontend origin(s) in production.");
        }
        for (String origin :
                Arrays.stream(rawOrigins.split(",")).map(String::trim).toList()) {
            if (origin.isEmpty()) {
                continue;
            }
            if ("*".equals(origin)) {
                throw new IllegalStateException(
                        "CORS_ALLOWED_ORIGINS cannot be '*' -- credentialed requests require explicit origins.");
            }
            if (origin.startsWith("http://") && !origin.startsWith("http://localhost")) {
                throw new IllegalStateException(
                        "CORS origin '" + origin + "' uses plaintext http. Use https in production.");
            }
        }
    }

    private void validateAi(boolean aiEnabled, String apiKey) {
        // An operator who set AI_ENABLED=true almost certainly forgot the key.
        if (aiEnabled && (apiKey == null || apiKey.isBlank())) {
            throw new IllegalStateException("AI_ENABLED=true but GEMINI_API_KEY is not set.");
        }
    }

    private void validateRedis(boolean redisEnabled, String password) {
        // An unauthenticated Redis holding rate-limit state lets anyone who can
        // reach it reset the buckets protecting login and OTP.
        if (redisEnabled && (password == null || password.isBlank())) {
            throw new IllegalStateException("REDIS_ENABLED=true but REDIS_PASSWORD is not set.");
        }
    }
}
