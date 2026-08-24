package com.skillswap.backend.realtime;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

/**
 * Server-to-client push socket.
 *
 * Deliberately one-way for application data: clients still send messages over
 * the REST API, which already carries the validation, rate limiting and error
 * handling. Accepting writes here would mean duplicating all of that on a
 * second transport for no gain.
 */
@Slf4j
@RequiredArgsConstructor
public class RealtimeWebSocketHandler extends TextWebSocketHandler {

    private final RealtimeSessionRegistry registry;

    @Override
    public void afterConnectionEstablished(@NonNull WebSocketSession session) {
        Long userId = userId(session);
        if (userId == null) {
            return;
        }
        registry.register(userId, session);
        log.debug("Realtime connected: user {} ({} users on this instance)", userId, registry.connectedUsers());
    }

    @Override
    public void afterConnectionClosed(@NonNull WebSocketSession session, @NonNull CloseStatus status) {
        Long userId = userId(session);
        if (userId != null) {
            registry.unregister(userId, session);
        }
    }

    @Override
    protected void handleTextMessage(@NonNull WebSocketSession session, @NonNull TextMessage message) throws Exception {
        // Only a keepalive is honoured. Proxies and load balancers drop idle
        // upgraded connections, so the client pings to keep the path open.
        if ("ping".equals(message.getPayload())) {
            synchronized (session) {
                session.sendMessage(new TextMessage("pong"));
            }
        }
    }

    @Override
    public void handleTransportError(@NonNull WebSocketSession session, @NonNull Throwable exception) {
        log.debug("Realtime transport error for user {}: {}", userId(session), exception.toString());
    }

    private Long userId(WebSocketSession session) {
        return (Long) session.getAttributes().get(JwtHandshakeInterceptor.USER_ID_ATTRIBUTE);
    }
}
