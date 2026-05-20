import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './use-auth';

const API_URL = 'http://localhost:8080/api/rooms';

export function useRooms() {
  const { token } = useAuth();

  const [thematicRooms, setThematicRooms] = useState([]);
  const [privateRooms, setPrivateRooms] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🏛️ Load Thematic Rooms
  const loadThematicRooms = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/thematic`, { 
        headers: {
          "Authorization": "Bearer " + token,
          "Content-Type": "application/json"
        } 
      });
      if (res.ok) {
        const data = await res.json();
        setThematicRooms(data);
      }
    } catch (err) {
      console.error("Error loading thematic rooms:", err);
    }
  }, [token]);

  // 🔒 Load Private Rooms
  const loadPrivateRooms = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/private/mine`, { 
        headers: {
          "Authorization": "Bearer " + token,
          "Content-Type": "application/json"
        } 
      });
      if (res.ok) {
        const data = await res.json();
        setPrivateRooms(data);
      }
    } catch (err) {
      console.error("Error loading private rooms:", err);
    }
  }, [token]);

  // 🔄 Load All Rooms
  const loadAll = useCallback(() => {
    loadThematicRooms();
    loadPrivateRooms();
  }, [loadThematicRooms, loadPrivateRooms]);

  // Effect to load on mount or token change
  useEffect(() => {
    if (token) loadAll();
  }, [token, loadAll]); // Añadido 'loadAll' siguiendo las buenas prácticas de React

  // ✨ Create a new private room
  const createPrivateRoom = useCallback(async (name, invitedEmails) => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/private`, {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + token,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, invitedEmails }),
      });
      if (!res.ok) throw new Error("Error al crear la sala");
      const room = await res.json();

      setPrivateRooms(prev => [...prev, room]);
      return room;
    } finally {
      setLoading(false);
    }
  }, [token]);
  
  // ✉️ Load Pending Invitations
  const loadInvitations = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/invitations/pending`, { 
        headers: {
          "Authorization": "Bearer " + token,
          "Content-Type": "application/json"
        } 
      });
      if (res.ok) {
        const data = await res.json();
        setInvitations(data);
      }
    } catch (err) {
      console.error("Error loading invitations:", err);
    }
  }, [token]);

  // 👀 Mark Invitations as Seen
  const markInvitationsSeen = useCallback(async () => {
    if (!token) return;
    try {
      await fetch(`${API_URL}/invitations/seen`, {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + token,
          "Content-Type": "application/json"
        }
      });
      setInvitations([]);
    } catch (err) {
      console.error("Error marking invitations as seen:", err);
    }
  }, [token]);

  // ➕ Add invitation dynamically
  const addInvitation = useCallback((invitation) => {
    setInvitations(prev => [...prev, invitation]);
    setPrivateRooms(prev => [...prev, invitation.room]);
  }, []);

  return {
    thematicRooms,
    privateRooms,
    invitations,
    loading,
    loadAll,
    createPrivateRoom,
    loadInvitations,
    markInvitationsSeen,
    addInvitation
  };
}