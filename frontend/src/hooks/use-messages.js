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

  // History
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

  // Subscription
  useEffect(() => {
    if (!activeRoomId) return;

    const topic = `/topic/chat.room.${activeRoomId}`;

    subscribe(topic, (message) => {
      setMessages(prev => {
        if (prev.some(m => m.id === message.id)) return prev;
        return [...prev, { ...message, isHistory: false }];
      });
    });

    return () => unsubscribe(topic);
  }, [activeRoomId]);

  // History when switch room o conect
  useEffect(() => {
    if (!connected || !activeRoomId) return;
    loadHistory(activeRoomId);
  }, [activeRoomId, connected]);

  // Send
  const sendMessage = useCallback((content, publish) => {
    if (!content.trim() || !connected) return;
    publish(`/app/chat.room.${activeRoomId}`, { content });
  }, [activeRoomId, connected]);

  return { messages, loadingHistory, error, sendMessage, loadHistory };
}