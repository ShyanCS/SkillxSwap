package com.skillswap.backend.common.logging;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.UUID;
import org.slf4j.MDC;
import org.springframework.lang.NonNull;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Tags every request with an id, exposed to logs via MDC (the {@code %X{requestId}}
 * slot in the log pattern) and returned as {@code X-Request-Id}.
 *
 * Without this, concurrent requests interleave in the log with no way to tell
 * which lines belong together -- the difference between debugging a production
 * incident in minutes versus guessing.
 *
 * An inbound X-Request-Id is honoured so a trace started at the reverse proxy
 * or client carries through, but it is length-capped and sanitised: the value
 * is attacker-controlled and ends up in log output.
 */
public class RequestIdFilter extends OncePerRequestFilter {

    public static final String HEADER = "X-Request-Id";
    private static final String MDC_KEY = "requestId";
    private static final int MAX_LENGTH = 64;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain)
            throws ServletException, IOException {
        String requestId = sanitise(request.getHeader(HEADER));
        MDC.put(MDC_KEY, requestId);
        response.setHeader(HEADER, requestId);
        try {
            filterChain.doFilter(request, response);
        } finally {
            // Threads are pooled: leaving the value behind would mis-attribute
            // every later request handled by this thread.
            MDC.remove(MDC_KEY);
        }
    }

    private String sanitise(String inbound) {
        if (inbound == null || inbound.isBlank()) {
            return UUID.randomUUID().toString();
        }
        String trimmed = inbound.length() > MAX_LENGTH ? inbound.substring(0, MAX_LENGTH) : inbound;
        // Strip anything that could forge log lines or break log parsing.
        String cleaned = trimmed.replaceAll("[^A-Za-z0-9._-]", "");
        return cleaned.isEmpty() ? UUID.randomUUID().toString() : cleaned;
    }
}
