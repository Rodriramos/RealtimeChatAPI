import { useState, useEffect } from "react";
import { useAuth } from "../hooks/use-auth.js";
import { useWebSocket } from "../hooks/use-websocket.js";
import { useRooms } from "../hooks/use-rooms.js";
import { useMessages } from "../hooks/use-messages.js";
import { useTyping } from "../hooks/use-typing.js";

import Sidebar from "../components/chat/side-bar.jsx";
import MessageList from "../components/chat/message-list.jsx";
import SendBar from "../components/chat/send-bar.jsx";
import RoomTabs from "../components/chat/room-tabs.jsx";
import RoomList from "../components/chat/room-list.jsx";
import InvitationPanel from "../components/chat/invitation-panel.jsx";
import CreateRoomForm from "../components/chat/create-room-form.jsx";
import Toast from "../components/chat/toast.jsx";

export default function ChatPage() {
  const { user, logout } = useAuth();
  const { connected, subscribe, unsubscribe, publish } = useWebSocket();

  const [activeRoom, setActiveRoom] = useState({ id: 1, name: "Global Room", type: "GLOBAL" });
  const [activeTab, setActiveTab] = useState("chat");

  const {
    thematicRooms,
    privateRooms,
    invitations,
    loading: roomsLoading,
    createPrivateRoom,
    markInvitationsSeen,
    addInvitation,
    loadInvitations,
  } = useRooms();

  const { messages, loadingHistory, sendMessage } = useMessages(
    activeRoom.id,
    { subscribe, unsubscribe, connected }
  );

  const { typingText, notifyTyping, clearTyping } = useTyping(
    activeRoom.id,
    { subscribe, unsubscribe, publish, connected }
  );

  // Loading invitations on connect
  useEffect(() => {
    if (connected) loadInvitations();
  }, [connected]);

  const handleSwitchRoom = (room) => {
    setActiveRoom(room);
    setActiveTab("chat");
  };

  const handleSend = (content) => {
    sendMessage(content, publish);
    clearTyping();
  };

  const handleCreateRoom = async (name, emails) => {
    const room = await createPrivateRoom(name, emails);
    handleSwitchRoom(room);
    return room;
  };

  const handleAcceptInvitation = (room) => {
    markInvitationsSeen();
    handleSwitchRoom(room);
  };

  return (
    <div className="flex h-screen bg-[#080c0e] overflow-hidden">

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

      <div className="flex flex-col flex-1 overflow-hidden">

        <RoomTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          invitationCount={invitations.length}
          activeRoomName={activeRoom.name}
          connected={connected}
        />

        {activeTab === "chat" && (
          <>
            <MessageList messages={messages} loading={loadingHistory} />
            {typingText && (
              <div className="px-4 py-1 text-[11px] text-[#6a8a98] font-mono italic bg-[#080c0e]">
                {typingText}
              </div>
            )}
            <SendBar onSend={handleSend} disabled={!connected} onTyping={notifyTyping} />
          </>
        )}

        {activeTab === "rooms" && (
          <RoomList
            thematicRooms={thematicRooms}
            privateRooms={privateRooms}
            onEnter={handleSwitchRoom}
          />
        )}

        {activeTab === "invitations" && (
          <InvitationPanel
            invitations={invitations}
            onAccept={handleAcceptInvitation}
            onMarkSeen={markInvitationsSeen}
          />
        )}

        {activeTab === "create" && (
          <CreateRoomForm
            onSubmit={handleCreateRoom}
            loading={roomsLoading}
          />
        )}

      </div>

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