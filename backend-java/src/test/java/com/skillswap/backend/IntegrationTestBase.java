package com.skillswap.backend;

import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Testcontainers;

/**
 * Shared setup for integration tests: a real PostgreSQL container with the
 * actual Flyway migrations applied, and a MockMvc bound to the full
 * application context (security filters included).
 *
 * The container is static so it starts once for the whole suite rather than
 * per test class. Each test starts from a clean slate via {@link #resetDatabase()}.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Testcontainers
public abstract class IntegrationTestBase {

    @ServiceConnection
    static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:16");

    static {
        POSTGRES.start();
    }

    @DynamicPropertySource
    static void testProperties(DynamicPropertyRegistry registry) {
        // Generous limits so tests exercising repeated logins aren't throttled.
        registry.add("app.ratelimit.otp-per-hour", () -> 1000);
        registry.add("app.ratelimit.login-per-15min", () -> 1000);
        registry.add("app.ratelimit.ai-per-hour", () -> 1000);
    }

    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    /**
     * Truncates all application tables between tests. Flyway's own history
     * table is left alone so migrations aren't re-run.
     */
    @BeforeEach
    void resetDatabase() {
        jdbcTemplate.execute(
                """
                TRUNCATE TABLE
                    reviews, wallet_transactions, wallets, sessions, matches,
                    match_requests, messages, conversations, notifications,
                    reports, user_skills, user_availability, otp_verifications, users
                RESTART IDENTITY CASCADE
                """);
    }
}
