package com.skillswap.backend.realtime;

import com.skillswap.backend.auth.security.JwtAuthenticationFilter;
import com.skillswap.backend.auth.security.JwtService;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.Cookie;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

/**
 * Authenticates the WebSocket handshake from the same httpOnly JWT cookie the
 * REST API uses, and stashes the caller's id for the handler.
 *
 * Identity is resolved here, once, rather than trusting anything the client
 * sends over the open socket -- a connected client that could name its own user
 * id would be able to subscribe to another account's messages.
 */
@Slf4j
@RequiredArgsConstructor
public class JwtHandshakeInterceptor implements HandshakeInterceptor {

    public static final String USER_ID_ATTRIBUTE = "userId";

    private final JwtService jwtService;

    @Override
    public boolean beforeHandshake(
            ServerHttpRequest request,
            ServerHttpResponse response,
            WebSocketHandler wsHandler,
            Map<String, Object> attributes) {
        String token = extractToken(request);
        if (token == null) {
            return false;
        }
        try {
            Claims claims = jwtService.parseClaims(token);
            attributes.put(USER_ID_ATTRIBUTE, Long.valueOf(claims.get("user_id").toString()));
            return true;
        } catch (Exception e) {
            // Expired or forged token: refuse the upgrade. Returning false makes
            // Spring answer the handshake with 403 and no socket is opened.
            log.debug("Rejecting WebSocket handshake: {}", e.toString());
            return false;
        }
    }

    @Override
    public void afterHandshake(
            ServerHttpRequest request, ServerHttpResponse response, WebSocketHandler wsHandler, Exception exception) {
        // Nothing to do.
    }

    private String extractToken(ServerHttpRequest request) {
        if (!(request instanceof ServletServerHttpRequest servletRequest)) {
            return null;
        }
        Cookie[] cookies = servletRequest.getServletRequest().getCookies();
        if (cookies == null) {
            return null;
        }
        for (Cookie cookie : cookies) {
            if (JwtAuthenticationFilter.COOKIE_NAME.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }
}
