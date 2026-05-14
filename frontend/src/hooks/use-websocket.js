import { useEffect, useRef, useState, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from './use-auth';

const WS_URL = 'http://localhost:8080/ws';

export function useWebSocket() {
  const { token } = useAuth();
  const clientRef = useRef(null);
  const subscriptionsRef = useRef({});

  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);

  // Connect to the WebSocket server
  useEffect(() => {
    if (!token) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      connectHeaders: { Authorization: "Bearer " + token },

      onConnect: () => {
        setConnected(true);
        setError(null);
      },

      onDisconnect: () => {
        setConnected(false);
      },

      onStompError: (frame) => {
        setError(frame.headers?.message || "WebSocket error");
        setConnected(false);
      },

      reconnectDelay: 5000,
    });

    client.activate();
    clientRef.current = client;

    // Cleanup on unmount
    return () => {
      client.deactivate();
      subscriptionsRef.current = {};
    };
  }, [token]);

  // Subscribe to a topic - Evit duplicate subscriptions
  const subscribe = useCallback((topic, callback) => {
    if (!connected || !clientRef.current) return;
    if (subscriptionsRef.current[topic]) return;

    const subscription = clientRef.current.subscribe(topic, (message) => {
      callback(JSON.parse(message.body));
    });

    subscriptionsRef.current[topic] = subscription;
    return subscription;
  }, []);

  // Unsubscribe from a topic
  const unsubscribe = useCallback((topic) => {
    const subscription = subscriptionsRef.current[topic];
    if (subscription) {
      subscription.unsubscribe();
      delete subscriptionsRef.current[topic];
    }
  }, []);

  // Publish a message to a topic
  const publish = useCallback((topic, message) => {
    if (!clientRef.current?.connected) return;
    clientRef.current.publish({
      destination: topic,
      body: JSON.stringify(message),
    });
  }, []);

  return { connected, error, subscribe, unsubscribe, publish };
}
