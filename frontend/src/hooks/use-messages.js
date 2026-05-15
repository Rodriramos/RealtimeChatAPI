import { useState, useCallback, useEffect, useRef } from "react";
import { useAuth } from "./use-auth";

const API_URL = "http://localhost:8080/api";

export function useMessages(activeRoomId, { subscribe, unsubscribe, connected }) {
  const { token } = useAuth();

  const [messages,       setMessages]       = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [error,          setError]          = useState(null);

  const headers = {
    "Authorization": "Bearer " + token,
    "Content-Type":  "application/json",
  };

  // ── HISTORIAL ────────────────────────────────────────────────────────
  const loadHistory = useCallback(async (roomId) => {
    setLoadingHistory(true);
    setError(null);
    setMessages([]);
    try {
      const res = await fetch(`${API_URL}/chat/room/${roomId}/history`, { headers });
      if (res.status === 403) throw new Error("You are not a member of this room");
      const data = await res.json();
      setMessages(data.reverse().map(m => ({ ...m, isHistory: true })));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingHistory(false);
    }
  }, [token]);

  // ── SUSCRIPCIÓN ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!activeRoomId) return;

    const topic = `/topic/chat.room.${activeRoomId}`;

    // subscribe maneja internamente si está conectado o no
    subscribe(topic, (message) => {
      setMessages(prev => {
        if (prev.some(m => m.id === message.id)) return prev;
        return [...prev, { ...message, isHistory: false }];
      });
    });

    return () => unsubscribe(topic);
  }, [activeRoomId]); // ← ya no depende de connected

  // ── HISTORIAL AL CAMBIAR DE SALA ──────────────────────────────────────
  useEffect(() => {
    if (!connected || !activeRoomId) return;
    loadHistory(activeRoomId);
  }, [activeRoomId, connected]);

  // ── ENVIAR ────────────────────────────────────────────────────────────
  const sendMessage = useCallback((content, publish) => {
    if (!content.trim() || !connected) return;
    publish(`/app/chat.room.${activeRoomId}`, { content });
  }, [activeRoomId, connected]);

  return { messages, loadingHistory, error, sendMessage, loadHistory };
}