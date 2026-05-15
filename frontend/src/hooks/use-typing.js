import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "./use-auth";

export function useTyping(activeRoomId, { subscribe, unsubscribe, publish, connected }) {
  const { user } = useAuth();

  const [typingUsers, setTypingUsers] = useState([]);
  const typingTimers = useRef({});
  const myTypingTimer = useRef(null);

  // Subscribe to typing notifications
  useEffect(() => {
    if (!activeRoomId || !user) return;

    const topic = `/topic/chat.room.${activeRoomId}.typing`;

    subscribe(topic, ({ username }) => {
      // Ignore notificaciones propias
      if (username === user.username) return;

      // Add user "is typing" a la lista (si no está ya)
      setTypingUsers(prev =>
        prev.includes(username) ? prev : [...prev, username]
      );

      // Reset timer to remove "is typing" después de 2s sin nuevas notificaciones
      if (typingTimers.current[username]) {
        clearTimeout(typingTimers.current[username]);
      }
      typingTimers.current[username] = setTimeout(() => {
        setTypingUsers(prev => prev.filter(u => u !== username));
        delete typingTimers.current[username];
      }, 2000);
    });

    return () => {
      unsubscribe(topic);
      // Clear timers al cambiar de sala
      Object.values(typingTimers.current).forEach(clearTimeout);
      typingTimers.current = {};
      setTypingUsers([]);
    };
  }, [activeRoomId]);

  const notifyTyping = useCallback(() => {
    if (!connected) return;

    publish(`/app/chat.room.${activeRoomId}.typing`, {});

    if (myTypingTimer.current) clearTimeout(myTypingTimer.current);
    myTypingTimer.current = setTimeout(() => {
      myTypingTimer.current = null;
    }, 1500);
  }, [activeRoomId, connected]);

  const clearTyping = useCallback(() => {
    setTypingUsers([]);
    Object.values(typingTimers.current).forEach(clearTimeout);
    typingTimers.current = {};
  }, []);

  
  const typingText = typingUsers.length === 0 ? null
  : typingUsers.length === 1 ? `${typingUsers[0]} is typing...`
  : typingUsers.length === 2 ? `${typingUsers[0]} and ${typingUsers[1]} are typing...`
  : "Several users are typing...";
  
  return { typingText, notifyTyping, clearTyping };
}