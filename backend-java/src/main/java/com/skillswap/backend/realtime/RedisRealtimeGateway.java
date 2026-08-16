package com.skillswap.backend.realtime;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.data.redis.core.StringRedisTemplate;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.nio.charset.StandardCharsets;
import java.util.Map;

/**
 * Fans events out through Redis pub/sub so they reach the user regardless of
 * which API instance holds their socket.
 *
 * Behind a load balancer the sender's HTTP request and the recipient's
 * WebSocket almost never land on the same replica, so a purely local gateway
 * would deliver correctly in development and then quietly stop working the
 * moment a second replica was added.
 *
 * The publisher does not also deliver locally: it subscribes to the same
 * channel, so a local delivery would double every event for users connected to
 * the publishing instance.
 */
@Slf4j
@RequiredArgsConstructor
public class RedisRealtimeGateway implements RealtimeGateway, MessageListener {

    public static final String CHANNEL = "skillswap:realtime";

    private final StringRedisTemplate redis;
    private final RealtimeSessionRegistry registry;
    private final ObjectMapper objectMapper;

    @Override
    public void publish(Long userId, RealtimeEvent event) {
        try {
            String envelope = objectMapper.writeValueAsString(Map.of("userId", userId, "event", event));
            redis.convertAndSend(CHANNEL, envelope);
        } catch (Exception e) {
            // Degrade to this instance's own sockets rather than losing the
            // event entirely -- a Redis outage shouldn't black out realtime for
            // the users who happen to be connected here.
            log.warn("Redis fan-out failed for event {} to user {}; delivering locally only: {}",
                    event.type(), userId, e.toString());
            deliverLocally(userId, event);
        }
    }

    /** Invoked on every instance, including the one that published. */
    @Override
    public void onMessage(Message message, byte[] pattern) {
        try {
            JsonNode envelope = objectMapper.readTree(new String(message.getBody(), StandardCharsets.UTF_8));
            Long userId = envelope.get("userId").asLong();
            registry.deliver(userId, objectMapper.writeValueAsString(envelope.get("event")));
        } catch (Exception e) {
            log.warn("Dropping malformed realtime envelope: {}", e.toString());
        }
    }

    private void deliverLocally(Long userId, RealtimeEvent event) {
        try {
            registry.deliver(userId, objectMapper.writeValueAsString(event));
        } catch (Exception e) {
            log.warn("Local realtime delivery also failed for user {}: {}", userId, e.toString());
        }
    }
}
