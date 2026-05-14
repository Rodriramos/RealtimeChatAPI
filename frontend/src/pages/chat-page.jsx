import { useState } from 'react';
import { useRooms } from '../../hooks/use-rooms';
import { useWebSocket } from '../../hooks/use-websocket';
import { useMessages } from '../../hooks/use-messages';
import { useAuth } from '../../hooks/use-auth';

import Sidebar from '../components/chat/side-bar';
import MessageList from '../components/chat/message-list';
import SendBar from '../components/chat/send-bar';
import RoomTabs from '../components/chat/room-tabs';
import Toast from '../components/ui/toast';

export default function ChatPage() {
  const { user, logout } = useAuth();

  const [activeRoom, setActiveRoom] = useState({ id: 1, name: "Global Room", type: "GLOBAL" });
  const [activeTab, setActiveTab] = useState("chat");

  const { connected, error, subscribe, unsubscribe, publish } = useWebSocket();

  const { 
    thematicRooms, 
    privateRooms, 
    invitations,
    loading: roomsLoading,
    loadAll,
    createPrivateRoom, 
    loadInvitations,
    markInvitationsSeen,
    addInvitation
  } = useRooms();

  const { messages, loadingHistory, sendMessage } = useMessages(
    activeRoom.id, 
    { subscribe, unsubscribe, connected }
  );

  // Notifications in real time for new invitations
  useState(() => {
    if (!connected || !user) return;
    subscribe(`/topic/user${user.id}`, (invitation) => {
      addInvitation({ id: inv.roomId, name: inv.roomName, type: "PRIVATE" });
    });
  }, [connected, user]);

  const handleSwitchRoom = (room) => {
    setActiveRoom(room);
    setActiveTab("chat");
  }

  const handleSend = (content) => {
    sendMessage(content, publish);
  }

  const handleCreateRoom = async (name, invitedEmails) => {
    const room = await createPrivateRoom(name, invitedEmails);
    handleSwitchRoom(room);
  }

  return (
    <div style={{ display: "flex", height: "100vh", background: "var(--bg)" }}>

      {/* SIDEBAR */}
      <Sidebar
        user={user}
        connected={connected}
        activeRoom={activeRoom}
        thematicRooms={thematicRooms}
        privateRooms={privateRooms}
        invitationCount={invitations.length}
        onSwitchRoom={handleSwitchRoom}
        onLogout={logout}
      />

      {/* MAIN */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* TABS */}
        <RoomTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          invitationCount={invitations.length}
          activeRoomName={activeRoom.name}
          connected={connected}
        />

        {/* CHAT */}
        {activeTab === "chat" && (
          <>
            <MessageList
              messages={messages}
              loading={loadingHistory}
            />
            <SendBar
              onSend={handleSend}
              disabled={!connected}
            />
          </>
        )}

        {/* ROOMS */}
        {activeTab === "rooms" && (
          <RoomsList
            thematicRooms={thematicRooms}
            privateRooms={privateRooms}
            onEnter={handleSwitchRoom}
          />
        )}

          {/* INVITATIONS */}
        {activeTab === "invitations" && (
          <InvitationPanel
            invitations={invitations}
            onAccept={(room) => { markInvitationsSeen(); handleSwitchRoom(room); }}
            onMarkSeen={markInvitationsSeen}
          />
        )}

        {/* CREATE ROOM */}
        {activeTab === "create" && (
          <CreateRoomForm
            onSubmit={handleCreateRoom}
            loading={roomsLoading}
          />
        )}
      </div>

      {/* TOASTS */}
      <Toast
        connected={connected}
        user={user}
        subscribe={subscribe}
        addInvitation={addInvitation}
        onRoomClick={handleSwitchRoom}
      />
    </div>
  );
}