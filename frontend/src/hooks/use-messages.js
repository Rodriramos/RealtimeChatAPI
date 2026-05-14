import { useState, useCallback, useEffect, useRef } from "react";
import { useAuth } from "./use-auth";

const API_URL = "http://localhost:8080/api";

export function useMessages(activeRoomId, { subscribe, unsubscribe, connected }) {
  const { token } = useAuth();

  const [messages, setMessages] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [error, setError] = useState(null);
  const activeRoomIdRef = useRef(activeRoomId);

  // Keep the ref updated with the latest activeRoomId for use in callbacks
  useEffect(() => {
    activeRoomIdRef.current = activeRoomId;
  }, [activeRoomId]);

  const headers = {
    "Authorization": "Bearer " + token,
    "Content-Type": "application/json"
  }

  const loadHistory = useCallback(async (roomId) => {
    setLoadingHistory(true);
    setError(null);
    setMessages([]);

    try {
      const res = await fetch(`${API_URL}/chat/rooms/${roomId}/history`, { headers });
      if (res.status === 403) throw new Error("You are not a member of this room");
      const data = await res.json();
      setMessages(data.reverse().map(m => ({ ...m, isHistory: true })));        
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingHistory(false);
    }
  }, [token]);

  // Subscribe to WebSocket messages for the active room
  useEffect(() => {
    if (!connected || !activeRoomId) return;

    const topic = `/topic/chat.room.${activeRoomId}`;

    subscribe(topic, (message) => {
      // Use the ref to get the latest activeRoomId in case it has changed
      if (activeRoomIdRef.current !== activeRoomId) return;
      setMessages(prev => [...prev, { ...message, isHistory: false }]);
    });

    // Load message history when joining a new room
    loadHistory(activeRoomId);

  }, [activeRoomId, connected]);

  const sendMessage = useCallback(async (content, publish) => {
    if (!content.trim() || !connected) return;
    publish(`/app/chat.room.${activeRoomId}`, { content });
  }, [activeRoomId, connected]);

  return { messages, loadingHistory, error, sendMessage, loadHistory };
}