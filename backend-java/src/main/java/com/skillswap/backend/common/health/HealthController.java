package com.skillswap.backend.common.health;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class HealthController {

    private final DataSource dataSource;

    @GetMapping("/api/health")
    public Map<String, Object> health() {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("status", "UP");
        try (Connection connection = dataSource.getConnection()) {
            body.put("database", connection.isValid(2) ? "UP" : "DOWN");
        } catch (Exception e) {
            body.put("database", "DOWN");
        }
        return body;
    }
}
