import { useNavigate } from "react-router-dom";

export default function Sidebar({
  user,
  connected,
  activeRoom,
  thematicRooms,
  privateRooms,
  invitationCount,
  onSwitchRoom,
  onLogout,
  onOpenProfile
}) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate("/login");
  };

  return (
    <div className="w-64 min-w-64 bg-[#182533] border-r border-[#101921] flex flex-col overflow-hidden font-sans">

      {/* HEADER */}
      <div className="flex items-center justify-between p-4 border-b border-[#101921]">
        <span className="text-[14px] font-semibold text-[#f5f5f5] tracking-wide">
          Real Time <span className="text-[#2481cc] font-bold text-[12px]">Chat</span>
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-[#7b92ab]">
            {connected ? "online" : "connecting..."}
          </span>
          <div className={`w-2 h-2 rounded-full transition-all ${connected ? "bg-[#2481cc]" : "bg-[#ef476f] animate-pulse"
            }`} />
        </div>
      </div>

      {/* ROOM SECTION */}
      <div className="flex-1 overflow-y-auto py-2 space-y-4">

        {/* GLOBAL */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#7b92ab] px-4 pb-1">
            Global
          </p>
          <RoomItem
            room={{ id: 1, name: "Global Room", type: "GLOBAL" }}
            active={activeRoom.type === "GLOBAL"}
            type="GLOBAL"
            onClick={onSwitchRoom}
          />
        </div>

        {/* THEMATIC */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#7b92ab] px-4 pb-1">
            Thematic Channels
          </p>
          {thematicRooms.length === 0 ? (
            <p className="px-5 py-2 text-[13px] text-[#52677a] italic">No thematic rooms</p>
          ) : (
            thematicRooms.map(r => (
              <RoomItem
                key={r.id}
                room={r}
                active={activeRoom.id === r.id}
                type="THEMATIC"
                onClick={onSwitchRoom}
              />
            ))
          )}
        </div>

        {/* PRIVATES */}
        <div>
          <div className="flex items-center px-4 pb-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#7b92ab]">
              Direct Messages
            </p>
            {invitationCount > 0 && (
              <span className="ml-auto bg-[#4cc37a] text-[#182533] text-[11px] font-bold px-2 py-0.5 rounded-full">
                {invitationCount}
              </span>
            )}
          </div>
          {privateRooms.length === 0 ? (
            <p className="px-5 py-2 text-[13px] text-[#52677a] italic">No private chats</p>
          ) : (
            privateRooms.map(r => (
              <RoomItem
                key={r.id}
                room={r}
                active={activeRoom.id === r.id}
                type="PRIVATE"
                onClick={onSwitchRoom}
              />
            ))
          )}
        </div>
      </div>

      {/* FOOTER */}
      <div className="mt-auto p-3 bg-[#111923] border-t border-[#101921] flex items-center justify-between gap-2">

        {/* BOTÓN DE PERFIL */}
        <button
          onClick={onOpenProfile} // <- Cambiado aquí
          className="flex items-center gap-2.5 min-w-0 flex-1 text-left hover:bg-[#1c242c] p-1.5 rounded-xl transition-colors cursor-pointer group"
          title="My Profile Settings"
        >
          <div className="w-8 h-8 rounded-full bg-[#2481cc] group-hover:bg-[#2893e6] flex items-center justify-center text-[13px] text-white font-semibold shrink-0 shadow-sm transition-colors">
            {user?.username?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[13px] font-medium text-[#f5f5f5] truncate group-hover:text-[#2481cc] transition-colors">
              {user?.username ?? "Anonymous"}
            </span>
            <span className="text-[11px] text-[#7b92ab] truncate">
              {user?.email ?? "View profile"}
            </span>
          </div>
        </button>

        {/* LOGOUT BUTTON */}
        <button
          onClick={handleLogout}
          className="text-[12px] text-[#7b92ab] hover:text-[#ef476f] p-2 rounded-lg hover:bg-[#1c242c] transition-colors cursor-pointer shrink-0"
          title="Logout"
        >
          Log Out
        </button>
      </div>

    </div>
  );
}

function RoomItem({ room, active, type, onClick }) {
  const getAvatarStyles = () => {
    if (type === "GLOBAL") return "bg-[#2b5278] text-[#4cc37a]";
    if (type === "PRIVATE") return "bg-[#344252] text-[#e39e3b]";
    return "bg-[#2f4356] text-[#2893e6]";
  };

  const getIcon = () => {
    if (type === "GLOBAL") return "🌐";
    if (type === "PRIVATE") return "👤";
    return "📣";
  };

  return (
    <div
      onClick={() => onClick(room)}
      className={`flex items-center gap-3 mx-2 px-3 py-2.5 rounded-lg cursor-pointer transition-all select-none
        ${active
          ? "bg-[#2481cc] text-white"
          : "text-[#f5f5f5] hover:bg-[#202b36]"
        }`}
    >
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] shrink-0 font-sans
        ${active ? "bg-[rgba(255,255,255,0.15)] text-white" : getAvatarStyles()}`}
      >
        {getIcon()}
      </div>

      <div className="flex-1 min-w-0">
        <p className={`text-[13.5px] truncate ${active ? "font-medium" : "text-[#f5f5f5]"}`}>
          {room.name}
        </p>
      </div>
    </div>
  );
}