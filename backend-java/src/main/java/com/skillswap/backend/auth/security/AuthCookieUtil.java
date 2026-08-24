package com.skillswap.backend.auth.security;

import java.time.Duration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

@Component
public class AuthCookieUtil {

    private final boolean secure;
    private final String sameSite;
    private final long expirationMs;

    public AuthCookieUtil(
            @Value("${app.cookie.secure}") boolean secure,
            @Value("${app.cookie.same-site}") String sameSite,
            @Value("${app.jwt.expiration-ms}") long expirationMs) {
        this.secure = secure;
        this.sameSite = sameSite;
        this.expirationMs = expirationMs;
    }

    public ResponseCookie buildTokenCookie(String token) {
        return ResponseCookie.from(JwtAuthenticationFilter.COOKIE_NAME, token)
                .httpOnly(true)
                .secure(secure)
                .sameSite(sameSite)
                .path("/")
                .maxAge(Duration.ofMillis(expirationMs))
                .build();
    }

    public ResponseCookie buildExpiredTokenCookie() {
        return ResponseCookie.from(JwtAuthenticationFilter.COOKIE_NAME, "")
                .httpOnly(true)
                .secure(secure)
                .sameSite(sameSite)
                .path("/")
                .maxAge(0)
                .build();
    }
}
