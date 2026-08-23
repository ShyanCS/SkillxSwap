package com.skillswap.backend.auth.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Reads the JWT from the httpOnly "token" cookie -- not an Authorization
 * header -- to match the frontend, which sends credentials: 'include' and
 * never sets a bearer header.
 */
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    public static final String COOKIE_NAME = "token";

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain)
            throws ServletException, IOException {
        extractTokenCookie(request).ifPresent(token -> authenticateFromToken(token, request));
        filterChain.doFilter(request, response);
    }

    private Optional<String> extractTokenCookie(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return Optional.empty();
        }
        for (Cookie cookie : cookies) {
            if (COOKIE_NAME.equals(cookie.getName())) {
                return Optional.ofNullable(cookie.getValue());
            }
        }
        return Optional.empty();
    }

    private void authenticateFromToken(String token, HttpServletRequest request) {
        if (SecurityContextHolder.getContext().getAuthentication() != null) {
            return;
        }
        try {
            Claims claims = jwtService.parseClaims(token);
            String email = claims.get("email", String.class);
            if (email == null) {
                return;
            }
            CustomUserDetails userDetails = (CustomUserDetails) userDetailsService.loadUserByUsername(email);
            if (!userDetails.isEnabled()) {
                // Suspended by an admin since this token was issued -- treat as
                // unauthenticated rather than trusting a still-valid signature.
                return;
            }
            UsernamePasswordAuthenticationToken authToken =
                    new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
            authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authToken);
        } catch (JwtException | IllegalArgumentException ex) {
            // Invalid/expired token: leave the request unauthenticated, downstream
            // access rules will reject it with 401 rather than throwing here.
            SecurityContextHolder.clearContext();
        }
    }
}
