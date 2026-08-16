package com.skillswap.backend.realtime;

/**
 * Pushes an event to a user wherever they happen to be connected.
 *
 * The implementation is what decides whether "wherever" means this instance
 * only or the whole deployment.
 */
public interface RealtimeGateway {
    void publish(Long userId, RealtimeEvent event);
}
