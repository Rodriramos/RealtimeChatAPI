import { useEffect, useRef, useState, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from './use-auth';

const WS_URL = 'http://localhost:8080/ws';

export function useWebSocket() {
  const { token } = useAuth();
  const clientRef        = useRef(null);
  const subscriptionsRef = useRef({});
  const pendingSubsRef   = useRef([]); // ← suscripciones pendientes antes de conectar

  const [connected, setConnected] = useState(false);
  const [error,     setError]     = useState(null);

  useEffect(() => {
    if (!token) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      connectHeaders: { Authorization: "Bearer " + token },

      onConnect: () => {
        setConnected(true);
        setError(null);

        // Execute pending subscriptions
        pendingSubsRef.current.forEach(({ topic, callback }) => {
          if (!subscriptionsRef.current[topic]) {
            const sub = client.subscribe(topic, (msg) => {
              callback(JSON.parse(msg.body));
            });
            subscriptionsRef.current[topic] = sub;
          }
        });
        pendingSubsRef.current = [];
      },

      onDisconnect: () => {
        setConnected(false);
        subscriptionsRef.current = {};
      },

      onStompError: (frame) => {
        setError(frame.headers?.message || "WebSocket error");
        setConnected(false);
      },

      reconnectDelay: 5000,
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
      subscriptionsRef.current = {};
      pendingSubsRef.current   = [];
    };
  }, [token]);

  const subscribe = useCallback((topic, callback) => {
    // If already subscribed, ignore
    if (subscriptionsRef.current[topic]) return;

    // If connected, subscribe immediately
    if (clientRef.current?.connected) {
      const sub = clientRef.current.subscribe(topic, (msg) => {
        callback(JSON.parse(msg.body));
      });
      subscriptionsRef.current[topic] = sub;
      return sub;
    }

    // If not connected, add to pending subscriptions
    pendingSubsRef.current.push({ topic, callback });
  }, []);

  const unsubscribe = useCallback((topic) => {
    const sub = subscriptionsRef.current[topic];
    if (sub) {
      sub.unsubscribe();
      delete subscriptionsRef.current[topic];
    }
    // Delete from pending if exists
    pendingSubsRef.current = pendingSubsRef.current.filter(s => s.topic !== topic);
  }, []);

  const publish = useCallback((topic, message) => {
    if (!clientRef.current?.connected) return;
    clientRef.current.publish({
      destination: topic,
      body: JSON.stringify(message),
    });
  }, []);

  return { connected, error, subscribe, unsubscribe, publish };
}