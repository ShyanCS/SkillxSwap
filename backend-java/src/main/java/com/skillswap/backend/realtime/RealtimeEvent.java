package com.skillswap.backend.realtime;

/**
 * A server-to-client push.
 *
 * {@code type} lets the browser route the event without a separate channel per
 * kind of update; {@code payload} is whatever DTO that type implies.
 */
public record RealtimeEvent(String type, Object payload) {

    public static final String MESSAGE_RECEIVED = "MESSAGE_RECEIVED";
    public static final String NOTIFICATION = "NOTIFICATION";

    public static RealtimeEvent message(Object payload) {
        return new RealtimeEvent(MESSAGE_RECEIVED, payload);
    }

    public static RealtimeEvent notification(Object payload) {
        return new RealtimeEvent(NOTIFICATION, payload);
    }
}
