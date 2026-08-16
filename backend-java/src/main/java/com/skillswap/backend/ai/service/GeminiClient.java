package com.skillswap.backend.ai.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
// Spring Boot 4 ships Jackson 3, whose packages live under `tools.jackson`.
// (The `com.fasterxml.jackson` v2 jars on the tree are runtime-only, pulled in
// transitively by JJWT, and are not on the compile classpath.)
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Thin client over the Gemini generateContent REST API.
 *
 * Deliberately talks HTTP directly rather than pulling in a vendor SDK: the
 * surface we need is one endpoint, and this keeps the dependency tree (and its
 * transitive CVE exposure) small.
 *
 * JSON is serialized and parsed explicitly through the injected ObjectMapper,
 * and the bodies are exchanged as Strings. A bare {@code RestClient.builder()}
 * carries no Jackson message converters, which fails silently in both
 * directions -- the request body serializes to {@code {}} and the response
 * can't be read back -- so we never rely on converter auto-registration here.
 *
 * The API key travels in the x-goog-api-key header rather than a query string
 * so it never lands in access logs or proxy traces.
 */
@Component
public class GeminiClient {

    private static final Logger log = LoggerFactory.getLogger(GeminiClient.class);

    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final String apiKey;
    private final String model;

    public GeminiClient(ObjectMapper objectMapper,
                         @Value("${app.ai.endpoint}") String endpoint,
                         @Value("${app.ai.api-key}") String apiKey,
                         @Value("${app.ai.model}") String model) {
        this.objectMapper = objectMapper;
        this.apiKey = apiKey;
        this.model = model;

        // Hard timeouts: an unresponsive upstream must not pin a request thread.
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout((int) Duration.ofSeconds(5).toMillis());
        requestFactory.setReadTimeout((int) Duration.ofSeconds(25).toMillis());

        this.restClient = RestClient.builder()
                .baseUrl(endpoint)
                .requestFactory(requestFactory)
                .build();
    }

    /**
     * @return the model's reply, or empty when the upstream failed or refused
     *         to answer. Callers surface a generic message -- upstream error
     *         detail is logged, never returned to the user.
     */
    public Optional<String> generate(String systemInstruction, String userMessage) {
        Map<String, Object> payload = Map.of(
                "system_instruction", Map.of("parts", List.of(Map.of("text", systemInstruction))),
                "contents", List.of(Map.of(
                        "role", "user",
                        "parts", List.of(Map.of("text", userMessage)))),
                "generationConfig", Map.of(
                        "temperature", 0.4,
                        "maxOutputTokens", 800)
        );

        try {
            String requestJson = objectMapper.writeValueAsString(payload);

            String responseJson = restClient.post()
                    .uri("/{model}:generateContent", model)
                    .header("x-goog-api-key", apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON)
                    .body(requestJson)
                    .retrieve()
                    .body(String.class);

            return extractText(responseJson);
        } catch (Exception e) {
            // Includes timeouts, 4xx (bad key, quota) and 5xx. Full detail stays
            // in the log (needed to diagnose upstream issues); the user gets a
            // neutral message from the service layer.
            log.error("Gemini request failed", e);
            return Optional.empty();
        }
    }

    private Optional<String> extractText(String responseJson) {
        if (responseJson == null || responseJson.isBlank()) {
            return Optional.empty();
        }

        JsonNode response = objectMapper.readTree(responseJson);

        JsonNode blockReason = response.path("promptFeedback").path("blockReason");
        if (!blockReason.isMissingNode()) {
            log.warn("Gemini blocked a prompt: {}", blockReason.asText());
            return Optional.empty();
        }

        JsonNode parts = response.path("candidates").path(0).path("content").path("parts");
        if (!parts.isArray() || parts.isEmpty()) {
            log.warn("Gemini returned no content; finishReason={}",
                    response.path("candidates").path(0).path("finishReason").asText("unknown"));
            return Optional.empty();
        }

        StringBuilder text = new StringBuilder();
        parts.forEach(part -> text.append(part.path("text").asText("")));

        String answer = text.toString().trim();
        return answer.isEmpty() ? Optional.empty() : Optional.of(answer);
    }
}
