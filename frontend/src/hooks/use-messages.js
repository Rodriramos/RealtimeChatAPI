import { useState, useCallback, useEffect } from "react";
import { useAuth } from "./use-auth";

const API_URL = "http://localhost:8080/api";

export function useMessages(activeRoomId, { subscribe, unsubscribe, connected }) {
  const { token } = useAuth();

  const [messages, setMessages] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [error, setError] = useState(null);

  // 🏛️ History
  const loadHistory = useCallback(async (roomId) => {
    if (!token) return; 
    
    setLoadingHistory(true);
    setError(null);
    setMessages([]);
    try {
      const res = await fetch(`${API_URL}/chat/room/${roomId}/history`, { 
        headers: {
          "Authorization": "Bearer " + token,
          "Content-Type": "application/json",
        } 
      });
      
      if (res.status === 401) throw new Error("Session expired or unauthorized");
      if (res.status === 403) throw new Error("You are not a member of this room");
      
      const data = await res.json();
      setMessages(data.reverse().map(m => ({ ...m, isHistory: true })));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingHistory(false);
    }
  }, [token]);

  // 📡 Subscription
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
  }, [activeRoomId, subscribe, unsubscribe]);

  // 🔄 Load History when switch room or connect
  useEffect(() => {
    if (!connected || !activeRoomId || !token) return;

    let isMounted = true;

    const fetchHistory = async () => {
      try {
        if (isMounted) {
          await loadHistory(activeRoomId);
        }
      } catch (err) {
        console.error("Failed to fetch history safely", err);
      }
    };

    fetchHistory();

    return () => {
      isMounted = false;
    };
  }, [activeRoomId, connected, token, loadHistory]);

  return {
    messages,
    loadingHistory,
    error,
    loadHistory
  };
}