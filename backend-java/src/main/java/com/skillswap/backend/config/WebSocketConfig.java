package com.skillswap.backend.config;

import com.skillswap.backend.auth.security.JwtService;
import com.skillswap.backend.realtime.JwtHandshakeInterceptor;
import com.skillswap.backend.realtime.LocalRealtimeGateway;
import com.skillswap.backend.realtime.RealtimeGateway;
import com.skillswap.backend.realtime.RealtimeSessionRegistry;
import com.skillswap.backend.realtime.RealtimeWebSocketHandler;
import com.skillswap.backend.realtime.RedisRealtimeGateway;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import tools.jackson.databind.ObjectMapper;

import java.util.List;

/**
 * Wires the realtime push socket at {@code /ws}.
 *
 * Plain WebSocket rather than STOMP over SockJS: traffic here is one-way
 * server-to-client notification, with clients still writing through the REST
 * API. A broker protocol and its client library would add moving parts without
 * addressing anything this actually needs.
 */
@Slf4j
@Configuration
@EnableWebSocket
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketConfigurer {

    private final JwtService jwtService;
    private final RealtimeSessionRegistry registry;

    @Value("${app.cors.allowed-origins}")
    private List<String> allowedOrigins;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry webSocketHandlerRegistry) {
        webSocketHandlerRegistry
                .addHandler(new RealtimeWebSocketHandler(registry), "/ws")
                .addInterceptors(new JwtHandshakeInterceptor(jwtService))
                // WebSocket handshakes are not covered by the CORS filter, so the
                // origin allowlist has to be repeated here. Without it Spring
                // defaults to same-origin only and the split frontend/API
                // deployment this app is built for could never connect.
                .setAllowedOrigins(allowedOrigins.toArray(String[]::new));
    }

    @Bean
    @ConditionalOnProperty(name = "app.redis.enabled", havingValue = "false", matchIfMissing = true)
    public RealtimeGateway localRealtimeGateway(ObjectMapper objectMapper) {
        log.info("Realtime delivery: in-process. Enable Redis before running multiple API replicas.");
        return new LocalRealtimeGateway(registry, objectMapper);
    }

    @Bean
    @ConditionalOnProperty(name = "app.redis.enabled", havingValue = "true")
    public RedisRealtimeGateway redisRealtimeGateway(StringRedisTemplate redisTemplate, ObjectMapper objectMapper) {
        log.info("Realtime delivery: Redis pub/sub (fans out across instances).");
        return new RedisRealtimeGateway(redisTemplate, registry, objectMapper);
    }

    /** Subscribes this instance to the fan-out channel so it can serve its own sockets. */
    @Bean
    @ConditionalOnProperty(name = "app.redis.enabled", havingValue = "true")
    public RedisMessageListenerContainer realtimeListenerContainer(RedisConnectionFactory connectionFactory,
                                                                    RedisRealtimeGateway gateway) {
        RedisMessageListenerContainer container = new RedisMessageListenerContainer();
        container.setConnectionFactory(connectionFactory);
        container.addMessageListener(gateway, new ChannelTopic(RedisRealtimeGateway.CHANNEL));
        return container;
    }
}
