import { useEffect, useRef, useState, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from './use-auth';

const WS_URL = 'http://localhost:8080/ws';

export function useWebSocket() {
  const { token } = useAuth();
  const clientRef        = useRef(null);
  const subscriptionsRef = useRef({});
  const pendingSubsRef   = useRef([]);

  const [connected, setConnected] = useState(false);
  const [error,     setError]     = useState(null);

  // Guardamos el token en una referencia para que los métodos de suscripción
  // siempre lean el token actual sin forzar la recreación de funciones.
  const tokenRef = useRef(token);
  useEffect(() => {
    tokenRef.current = token;
  }, [token]);

  useEffect(() => {
    if (!token) {
      // Si no hay token (logout), forzamos desconexión limpia
      if (clientRef.current?.active) {
        clientRef.current.deactivate();
      }
      setConnected(false);
      return;
    }

    // Si ya hay un cliente activo y conectado, NO lo destruyas por un cambio de perfil
    if (clientRef.current?.active) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      connectHeaders: { Authorization: "Bearer " + token },

      onConnect: () => {
        setConnected(true);
        setError(null);

        // Ejecutar suscripciones pendientes
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
      // Solo desactivar si realmente el token desapareció o el componente se desmonta por completo
      if (!tokenRef.current) {
        client.deactivate();
        subscriptionsRef.current = {};
        pendingSubsRef.current   = [];
      }
    };
  }, [token]); // El efecto vigila el token, pero la salvaguarda interna impide el reconect bugeado

  const subscribe = useCallback((topic, callback) => {
    if (subscriptionsRef.current[topic]) return;

    if (clientRef.current?.connected) {
      const sub = clientRef.current.subscribe(topic, (msg) => {
        callback(JSON.parse(msg.body));
      });
      subscriptionsRef.current[topic] = sub;
      return sub;
    }

    pendingSubsRef.current.push({ topic, callback });
  }, []);

  const unsubscribe = useCallback((topic) => {
    const sub = subscriptionsRef.current[topic];
    if (sub) {
      sub.unsubscribe();
      delete subscriptionsRef.current[topic];
    }
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