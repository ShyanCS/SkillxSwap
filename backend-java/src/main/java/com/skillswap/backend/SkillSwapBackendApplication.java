package com.skillswap.backend;

import java.util.TimeZone;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class SkillSwapBackendApplication {

    public static void main(String[] args) {
        // The JVM's default timezone name (derived from the OS) can be a legacy
        // alias (e.g. "Asia/Calcutta" on some Windows locales) that the Postgres
        // server's tzdata doesn't recognize. Pin to UTC before any DB connection
        // is opened, consistent with storing all timestamps as TIMESTAMPTZ.
        TimeZone.setDefault(TimeZone.getTimeZone("UTC"));
        SpringApplication.run(SkillSwapBackendApplication.class, args);
    }
}
