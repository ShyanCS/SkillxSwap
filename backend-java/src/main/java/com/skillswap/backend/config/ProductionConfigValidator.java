package com.skillswap.backend.config;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import java.nio.charset.StandardCharsets;
import java.util.List;

/**
 * Refuses to start the application if production is misconfigured in a way that
 * would be insecure but otherwise silent -- a weak signing key, a leftover dev
 * key, or a CORS policy that trusts everything.
 *
 * These are deliberately hard failures: a service that won't boot is a far
 * better outcome than one that boots and quietly accepts forged tokens.
 */
@Configuration
@Profile("prod")
public class ProductionConfigValidator {

    private static final Logger log = LoggerFactory.getLogger(ProductionConfigValidator.class);

    /** HS256 needs 256 bits; require that as an absolute floor. */
    private static final int MIN_SECRET_BYTES = 32;

    private final String jwtSecret;
    private final List<String> corsOrigins;
    private final boolean aiEnabled;
    private final String aiApiKey;

    public ProductionConfigValidator(@Value("${app.jwt.secret}") String jwtSecret,
                                      @Value("${app.cors.allowed-origins}") List<String> corsOrigins,
                                      @Value("${app.ai.enabled}") boolean aiEnabled,
                                      @Value("${app.ai.api-key}") String aiApiKey) {
        this.jwtSecret = jwtSecret;
        this.corsOrigins = corsOrigins;
        this.aiEnabled = aiEnabled;
        this.aiApiKey = aiApiKey;
    }

    @PostConstruct
    void validate() {
        validateJwtSecret();
        validateCors();
        validateAi();
        log.info("Production configuration validated");
    }

    private void validateJwtSecret() {
        int bytes = jwtSecret.getBytes(StandardCharsets.UTF_8).length;
        if (bytes < MIN_SECRET_BYTES) {
            throw new IllegalStateException(
                    "JWT_SECRET is too short (" + bytes + " bytes). Use at least " + MIN_SECRET_BYTES
                            + " bytes of random data, e.g. `openssl rand -base64 48`.");
        }
        if (jwtSecret.contains("dev-only") || jwtSecret.contains("change-me")) {
            throw new IllegalStateException(
                    "JWT_SECRET still contains a development placeholder value. Generate a real secret "
                            + "with `openssl rand -base64 48`.");
        }
    }

    private void validateCors() {
        if (corsOrigins.isEmpty()) {
            throw new IllegalStateException("CORS_ALLOWED_ORIGINS must list your frontend origin(s) in production.");
        }
        for (String origin : corsOrigins) {
            String trimmed = origin.trim();
            if ("*".equals(trimmed)) {
                throw new IllegalStateException(
                        "CORS_ALLOWED_ORIGINS cannot be '*' -- credentialed requests require explicit origins.");
            }
            if (trimmed.startsWith("http://") && !trimmed.startsWith("http://localhost")) {
                throw new IllegalStateException(
                        "CORS origin '" + trimmed + "' uses plaintext http. Use https in production.");
            }
        }
    }

    private void validateAi() {
        // Not fatal: the assistant degrades gracefully when unconfigured, but an
        // operator who set AI_ENABLED=true almost certainly forgot the key.
        if (aiEnabled && (aiApiKey == null || aiApiKey.isBlank())) {
            throw new IllegalStateException("AI_ENABLED=true but GEMINI_API_KEY is not set.");
        }
    }
}
