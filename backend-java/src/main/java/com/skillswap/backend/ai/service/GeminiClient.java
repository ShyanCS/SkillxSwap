package com.skillswap.backend.ai.service;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

/**
 * Thin client over the Gemini generateContent REST API.
 *
 * Deliberately talks HTTP directly rather than pulling in a vendor SDK: the
 * surface we need is one endpoint, and this keeps the dependency tree (and its
 * transitive CVE exposure) small.
 *
 * JSON is serialized and parsed explicitly through the injected ObjectMapper,
 * and the response is read as a raw stream. HTTP message converters are avoided
 * on both sides on purpose: a bare {@code RestClient.builder()} carries almost
 * none, so relying on them failed twice here in different ways -- request
 * bodies serialized to {@code {}}, and responses became unreadable whenever
 * Gemini answered with application/octet-stream instead of application/json.
 *
 * The API key travels in the x-goog-api-key header rather than a query string
 * so it never lands in access logs or proxy traces.
 */
@Component
public class GeminiClient {

    private static final Logger log = LoggerFactory.getLogger(GeminiClient.class);

    /** Kept low: the caller is a user waiting on an HTTP response, not a batch job. */
    private static final int MAX_ATTEMPTS = 3;

    private static final Duration RETRY_BACKOFF = Duration.ofMillis(600);

    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final String apiKey;
    private final String model;

    public GeminiClient(
            ObjectMapper objectMapper,
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
                "contents", List.of(Map.of("role", "user", "parts", List.of(Map.of("text", userMessage)))),
                "generationConfig", Map.of("temperature", 0.4, "maxOutputTokens", 800));

        String requestJson;
        try {
            requestJson = objectMapper.writeValueAsString(payload);
        } catch (Exception e) {
            log.error("Could not serialize the Gemini request", e);
            return Optional.empty();
        }

        for (int attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
            RawResponse response;
            try {
                response = send(requestJson);
            } catch (Exception e) {
                // Transport-level only (timeout, DNS, connection reset), since
                // exchange() does not raise on HTTP error statuses.
                log.error("Gemini request failed (model={})", model, e);
                return Optional.empty();
            }

            // Only 5xx is retried. 503 ("high demand") is genuinely transient
            // and usually succeeds a moment later.
            //
            // 429 is deliberately NOT retried, despite looking similar: it means
            // the key's quota is already exhausted, so an immediate retry spends
            // more of the quota it is waiting on. Retrying it measurably made
            // things worse here -- success went from 4/6 to 1/8, because each
            // user request was burning three quota units instead of one.
            boolean retryable = response.status() >= 500;
            if (retryable && attempt < MAX_ATTEMPTS) {
                log.warn("Gemini attempt {}/{} got HTTP {}, retrying", attempt, MAX_ATTEMPTS, response.status());
                if (!sleep(RETRY_BACKOFF.multipliedBy(attempt))) {
                    return Optional.empty();
                }
                continue;
            }
            if (response.status() == 429) {
                // Called out separately because the cause is operational, not a
                // code defect: the key is out of quota and the fix is a bigger
                // plan or fewer calls, not a retry or a redeploy.
                log.error(
                        "Gemini quota exhausted for this API key (model={}). "
                                + "The assistant will keep returning 'unavailable' until quota resets.",
                        model);
                return Optional.empty();
            }
            if (response.status() >= 400) {
                // Permanent failures (bad key, retired model id, malformed
                // request) are logged with the upstream message, which is what
                // makes a retired model diagnosable in seconds.
                log.error(
                        "Gemini returned HTTP {} (model={}): {}",
                        response.status(),
                        model,
                        abbreviate(response.body()));
                return Optional.empty();
            }
            return extractText(response.body());
        }
        return Optional.empty();
    }

    private record RawResponse(int status, String body) {}

    /**
     * Reads the response as raw bytes, bypassing HTTP message converters.
     *
     * Gemini intermittently answers with Content-Type: application/octet-stream
     * rather than application/json. A bare RestClient carries only a JSON
     * converter, so any other content type fails extraction no matter what type
     * is requested -- an intermittent failure that reads like an upstream
     * outage but is really a header mismatch on a perfectly good JSON body.
     * exchange() hands over the stream directly, so the content type stops
     * mattering.
     */
    private RawResponse send(String requestJson) {
        return restClient
                .post()
                .uri("/{model}:generateContent", model)
                .header("x-goog-api-key", apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON)
                .body(requestJson)
                .exchange((request, response) -> new RawResponse(
                        response.getStatusCode().value(),
                        new String(response.getBody().readAllBytes(), StandardCharsets.UTF_8)));
    }

    private String abbreviate(String body) {
        if (body == null) {
            return "";
        }
        String flattened = body.replaceAll("\\s+", " ").trim();
        return flattened.length() <= 300 ? flattened : flattened.substring(0, 300) + "...";
    }

    /** @return false if the wait was interrupted, so the caller stops retrying. */
    private boolean sleep(Duration duration) {
        try {
            Thread.sleep(duration.toMillis());
            return true;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return false;
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
            log.warn(
                    "Gemini returned no content; finishReason={}",
                    response.path("candidates").path(0).path("finishReason").asText("unknown"));
            return Optional.empty();
        }

        StringBuilder text = new StringBuilder();
        parts.forEach(part -> text.append(part.path("text").asText("")));

        String answer = text.toString().trim();
        return answer.isEmpty() ? Optional.empty() : Optional.of(answer);
    }
}
