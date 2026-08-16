package com.skillswap.backend.realtime;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import tools.jackson.databind.ObjectMapper;

/**
 * Delivers only to sockets held by this instance.
 *
 * Correct for a single-replica deployment. Behind a load balancer with several
 * replicas it silently drops events, because the recipient's browser is very
 * likely connected to a different instance than the one processing the sender's
 * request -- which is what the Redis-backed gateway exists to fix.
 */
@Slf4j
@RequiredArgsConstructor
public class LocalRealtimeGateway implements RealtimeGateway {

    private final RealtimeSessionRegistry registry;
    private final ObjectMapper objectMapper;

    @Override
    public void publish(Long userId, RealtimeEvent event) {
        try {
            registry.deliver(userId, objectMapper.writeValueAsString(event));
        } catch (Exception e) {
            // Realtime delivery is an enhancement over polling, never a
            // correctness requirement: the data is already committed and the
            // client will pick it up on its next fetch.
            log.warn("Failed to publish realtime event {} to user {}: {}", event.type(), userId, e.toString());
        }
    }
}
