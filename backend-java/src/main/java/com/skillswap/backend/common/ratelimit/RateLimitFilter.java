package com.skillswap.backend.common.ratelimit;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.lang.NonNull;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Rejects abusive callers before they reach application code.
 *
 * Runs ahead of the Spring Security chain so that rejection is as cheap as
 * possible -- these endpoints are publicly reachable by design, so they are
 * the ones an attacker would target:
 *
 *   /api/auth/request-otp  sends real email to an attacker-chosen address,
 *                          so it is an open relay without a limit
 *   /api/auth/login        password brute force
 *   /api/auth/register     account-creation flooding
 *   /api/auth/reset        password-reset abuse
 *   /api/ai/**             costs real money per call
 */
@RequiredArgsConstructor
public class RateLimitFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(RateLimitFilter.class);

    private final RateLimiterService rateLimiter;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain)
            throws ServletException, IOException {
        RateLimiterService.Limit limit = limitFor(request);
        if (limit == null) {
            filterChain.doFilter(request, response);
            return;
        }

        String clientKey = clientKey(request);
        RateLimitDecision decision = rateLimiter.check(limit, clientKey);
        if (decision.allowed()) {
            filterChain.doFilter(request, response);
            return;
        }

        log.warn("Rate limit {} exceeded for {} on {}", limit, clientKey, request.getRequestURI());
        writeTooManyRequests(response, decision.retryAfterSeconds());
    }

    private RateLimiterService.Limit limitFor(HttpServletRequest request) {
        String path = request.getRequestURI();

        if (path.startsWith("/api/ai/")) {
            return RateLimiterService.Limit.AI;
        }
        // Only POSTs mutate or cost anything; GETs on these paths don't exist.
        if (!HttpMethod.POST.matches(request.getMethod())) {
            return null;
        }
        if (path.equals("/api/auth/request-otp")) {
            return RateLimiterService.Limit.OTP;
        }
        if (path.equals("/api/auth/login") || path.equals("/api/auth/register") || path.equals("/api/auth/reset")) {
            return RateLimiterService.Limit.LOGIN;
        }
        return null;
    }

    /**
     * Client IP. `server.forward-headers-strategy: native` makes Tomcat resolve
     * this from X-Forwarded-For when running behind a trusted proxy, so callers
     * can't all collapse into a single proxy-IP bucket.
     */
    private String clientKey(HttpServletRequest request) {
        String remote = request.getRemoteAddr();
        return remote != null ? remote : "unknown";
    }

    private void writeTooManyRequests(HttpServletResponse response, long retryAfterSeconds) throws IOException {
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setHeader(HttpHeaders.RETRY_AFTER, String.valueOf(retryAfterSeconds));
        // Matches the {"error": "..."} envelope the frontend already parses.
        response.getWriter()
                .write("{\"error\":\"Too many requests. Please try again in " + retryAfterSeconds + " seconds.\"}");
    }
}
