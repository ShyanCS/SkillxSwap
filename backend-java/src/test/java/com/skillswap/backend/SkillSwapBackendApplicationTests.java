package com.skillswap.backend;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/**
 * Smoke test. Because the context boots with {@code ddl-auto: validate} against
 * a real PostgreSQL container, this failing means either the wiring is broken
 * or a JPA entity has drifted from the Flyway migrations.
 */
class SkillSwapBackendApplicationTests extends IntegrationTestBase {

    @Test
    @DisplayName("application context loads and entities match the migrated schema")
    void contextLoads() {}
}
