import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { API_BASE_URL } from '../config/api';
import { useAuth } from './AuthContext';
import logger from '../lib/logger';

const RealtimeContext = createContext(undefined);

export const useRealtime = () => {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
};

// Corporate proxies and some networks block WebSocket upgrades outright, and a
// socket can also die quietly. Everything here is an optimisation over the
// existing polling, never a replacement for it, so a permanently failed socket
// degrades the app to its previous behaviour rather than breaking it.
const RECONNECT_BASE_MS = 1000;
const RECONNECT_MAX_MS = 30000;
const KEEPALIVE_MS = 25000;

/** A float in [0, 1), same range as Math.random(), sourced from the Web Crypto API. */
const randomUnitInterval = () => crypto.getRandomValues(new Uint32Array(1))[0] / 2 ** 32;

const toWebSocketUrl = (base) => {
  // API_BASE_URL may be relative (same-origin deploys), so resolve against the
  // page before swapping the scheme.
  const absolute = new URL(base || '', window.location.origin);
  absolute.protocol = absolute.protocol === 'https:' ? 'wss:' : 'ws:';
  absolute.pathname = `${absolute.pathname.replace(/\/$/, '')}/ws`;
  return absolute.toString();
};

export const RealtimeProvider = ({ children }) => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);

  const socketRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const keepaliveTimerRef = useRef(null);
  const attemptRef = useRef(0);
  // Subscribers are held in a ref so that adding one never re-runs the effect
  // that owns the socket -- that would tear down and rebuild the connection
  // every time a component mounted.
  const listenersRef = useRef(new Map());

  const subscribe = useCallback((eventType, handler) => {
    const forType = listenersRef.current.get(eventType) ?? new Set();
    forType.add(handler);
    listenersRef.current.set(eventType, forType);
    return () => {
      forType.delete(handler);
    };
  }, []);

  useEffect(() => {
    if (!user) {
      return undefined;
    }

    let disposed = false;

    const clearTimers = () => {
      clearTimeout(reconnectTimerRef.current);
      clearInterval(keepaliveTimerRef.current);
    };

    const connect = () => {
      if (disposed) return;

      let socket;
      try {
        // The handshake authenticates from the same httpOnly cookie the REST
        // API uses, so there is no token to pass here.
        socket = new WebSocket(toWebSocketUrl(API_BASE_URL));
      } catch {
        scheduleReconnect();
        return;
      }
      socketRef.current = socket;

      socket.onopen = () => {
        if (disposed) return;
        attemptRef.current = 0;
        setIsConnected(true);
        keepaliveTimerRef.current = setInterval(() => {
          if (socket.readyState === WebSocket.OPEN) socket.send('ping');
        }, KEEPALIVE_MS);
      };

      socket.onmessage = (event) => {
        if (event.data === 'pong') return;
        let payload;
        try {
          payload = JSON.parse(event.data);
        } catch {
          return;
        }
        const handlers = listenersRef.current.get(payload.type);
        if (!handlers) return;
        handlers.forEach(handler => {
          try {
            handler(payload.payload);
          } catch (error) {
            // One bad subscriber must not stop the others from being notified.
            logger.error('Realtime handler failed:', error);
          }
        });
      };

      socket.onclose = () => {
        setIsConnected(false);
        clearInterval(keepaliveTimerRef.current);
        if (!disposed) scheduleReconnect();
      };

      socket.onerror = () => {
        // onclose always follows, which is where reconnect is handled.
        socket.close();
      };
    };

    const scheduleReconnect = () => {
      // Exponential backoff with jitter: without the spread, every client
      // dropped by a restart would reconnect in lockstep and stampede the
      // instance that just came back.
      //
      // crypto.getRandomValues rather than Math.random -- not because jitter
      // timing is security-sensitive, but because it removes any ambiguity for
      // a reader (or a scanner) about whether this value ever influences
      // something that matters. Same cost, no downside.
      const backoff = Math.min(RECONNECT_BASE_MS * 2 ** attemptRef.current, RECONNECT_MAX_MS);
      const jittered = backoff * (0.5 + randomUnitInterval() * 0.5);
      attemptRef.current += 1;
      reconnectTimerRef.current = setTimeout(connect, jittered);
    };

    connect();

    return () => {
      disposed = true;
      clearTimers();
      setIsConnected(false);
      const socket = socketRef.current;
      if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
        socket.close();
      }
      socketRef.current = null;
    };
  }, [user]);

  return (
    <RealtimeContext.Provider value={{ subscribe, isConnected }}>
      {children}
    </RealtimeContext.Provider>
  );
};
