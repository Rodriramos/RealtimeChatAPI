import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './use-auth';

const API_URL = 'http://localhost:8080/api/rooms';

export function useRooms() {
  const { token } = useAuth();

  const [thematicRooms, setThematicRooms] = useState([]);
  const [privateRooms, setPrivateRooms] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(false);

  const headers = {
    "Authorization": "Bearer " + token,
    "Content-Type": "application/json"
  };

  const loadThematicRooms = useCallback(async () => {
    const res = await fetch(`${API_URL}/thematic`, { headers });
    const data = await res.json();
    setThematicRooms(data);
  }, [token]);

  const loadPrivateRooms = useCallback(async () => {
    const res = await fetch(`${API_URL}/private/mine`, { headers });
    const data = await res.json();
    setPrivateRooms(data);
  }, [token]);

  const loadAll = useCallback(() => {
    loadThematicRooms();
    loadPrivateRooms();
  }, [loadThematicRooms, loadPrivateRooms]);

  useEffect(() => {
    if (token) loadAll();
  }, [token]);

  // Create a new private room
  const createPrivateRoom = useCallback(async (name, invitedEmails) => {
    setLoading(true);
    try {
      const res  = await fetch(`${API_URL}/private`, {
        method:  "POST",
        headers,
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
  
  const loadInvitations = useCallback(async () => {
    const res = await fetch(`${API_URL}/invitations/pending`, { headers });
    const data = await res.json();
    setInvitations(data);
  }, [token]);

  const markInvitationsSeen = useCallback(async () => {
    await fetch(`${API_URL}/invitations/seen`, {
      method: "POST",
      headers
    });
    setInvitations([]);
  }, [token]);

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