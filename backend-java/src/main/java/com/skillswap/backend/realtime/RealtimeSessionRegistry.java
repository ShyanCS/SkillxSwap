package com.skillswap.backend.realtime;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import java.io.IOException;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * The live WebSocket connections held by <em>this</em> instance, keyed by user.
 *
 * One user maps to a set rather than a single session because the same account
 * is routinely open in several tabs or on a phone and laptop at once, and an
 * event has to reach all of them.
 */
@Slf4j
@Component
public class RealtimeSessionRegistry {

    private final Map<Long, Set<WebSocketSession>> sessionsByUser = new ConcurrentHashMap<>();

    public void register(Long userId, WebSocketSession session) {
        sessionsByUser.computeIfAbsent(userId, id -> ConcurrentHashMap.newKeySet()).add(session);
    }

    public void unregister(Long userId, WebSocketSession session) {
        // Compute-and-remove rather than get-then-remove: leaving an empty set
        // behind would leak one map entry per user who ever connected.
        sessionsByUser.computeIfPresent(userId, (id, sessions) -> {
            sessions.remove(session);
            return sessions.isEmpty() ? null : sessions;
        });
    }

    /** Writes a pre-serialized frame to every live session for this user. */
    public void deliver(Long userId, String payload) {
        Set<WebSocketSession> sessions = sessionsByUser.get(userId);
        if (sessions == null || sessions.isEmpty()) {
            return;
        }
        TextMessage frame = new TextMessage(payload);
        for (WebSocketSession session : sessions) {
            try {
                if (session.isOpen()) {
                    // Sends on one session are serialized: concurrent writes to
                    // the same connection interleave frames and corrupt the
                    // stream, and two events for one user can land at once.
                    synchronized (session) {
                        session.sendMessage(frame);
                    }
                }
            } catch (IOException | IllegalStateException e) {
                // A dead or half-closed socket must not break delivery to the
                // user's other tabs, nor propagate into the business
                // transaction that raised the event.
                log.debug("Dropping realtime frame for user {}: {}", userId, e.toString());
            }
        }
    }

    /** Live connection count, for diagnostics. */
    public int connectedUsers() {
        return sessionsByUser.size();
    }
}
