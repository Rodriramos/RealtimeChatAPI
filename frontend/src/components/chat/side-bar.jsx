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
}) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate("/login");
  };

  return (
    <div className="w-60 min-w-60 bg-[#0d1214] border-r border-[#1c2428] flex flex-col overflow-hidden font-mono">

      {/* HEADER */}
      <div className="flex items-center gap-2 p-4 border-b border-[#1c2428]">
        <div className={`w-2 h-2 rounded-full transition-all ${
          connected
            ? "bg-[#00d4aa] shadow-[0_0_6px_#00d4aa]"
            : "bg-[#334450]"
        }`} />
        <span className="text-[11px] tracking-widest uppercase text-[#6a8a98]">
          realtime<span className="text-[#00d4aa]">/</span>chat
        </span>
      </div>

      {/* GLOBAL */}
      <div className="py-2 border-b border-[#1c2428]">
        <p className="text-[9px] tracking-[0.2em] uppercase text-[#334450] px-4 pb-1.5 font-medium">
          Global
        </p>
        <RoomItem
          room={{ id: 1, name: "Global Room", type: "GLOBAL" }}
          active={activeRoom.type === "GLOBAL"}
          icon="#"
          onClick={onSwitchRoom}
        />
      </div>

      {/* THEMATIC */}
      <div className="py-2 border-b border-[#1c2428] flex-1 overflow-y-auto">
        <p className="text-[9px] tracking-[0.2em] uppercase text-[#334450] px-4 pb-1.5 font-medium">
          Thematic
        </p>
        {thematicRooms.length === 0
          ? <p className="px-4 text-[11px] text-[#2a3d48]">sin salas temáticas</p>
          : thematicRooms.map(r => (
              <RoomItem
                key={r.id}
                room={r}
                active={activeRoom.id === r.id}
                icon="#"
                onClick={onSwitchRoom}
              />
            ))
        }
      </div>

      {/* PRIVATES */}
      <div className="py-2 border-b border-[#1c2428] max-h-44 overflow-y-auto">
        <div className="flex items-center px-4 pb-1.5">
          <p className="text-[9px] tracking-[0.2em] uppercase text-[#334450] font-medium">
            Privates
          </p>
          {invitationCount > 0 && (
            <span className="ml-auto bg-purple-500 text-white text-[9px] font-medium px-1.5 py-px rounded-full">
              {invitationCount}
            </span>
          )}
        </div>
        {privateRooms.length === 0
          ? <p className="px-4 text-[11px] text-[#2a3d48]">sin salas privadas</p>
          : privateRooms.map(r => (
              <RoomItem
                key={r.id}
                room={r}
                active={activeRoom.id === r.id}
                icon="🔒"
                onClick={onSwitchRoom}
              />
            ))
        }
      </div>

      {/* FOOTER */}
      <div className="mt-auto p-4 border-t border-[#1c2428] flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#012820] border border-[#007a60] flex items-center justify-center text-[11px] text-[#00d4aa] font-semibold shrink-0">
            {user?.username?.[0]?.toUpperCase() ?? "?"}
          </div>
          <span className="text-[12px] text-[#c8d8e0] truncate flex-1">
            {user?.username ?? "—"}
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="w-full text-left text-[10px] text-[#334450] border border-[#1c2428] px-2.5 py-1.5 rounded-sm font-mono tracking-wide transition-all hover:border-[#e05060] hover:text-[#e05060] hover:bg-[#200810] cursor-pointer"
        >
          → logout
        </button>
      </div>

    </div>
  );
}

function RoomItem({ room, active, icon, onClick }) {
  return (
    <div
      onClick={() => onClick(room)}
      className={`flex items-center gap-2 px-4 py-1.5 cursor-pointer text-[12px] transition-all border-l-2 select-none
        ${active
          ? "bg-[#111618] text-[#00d4aa] border-[#00d4aa]"
          : "text-[#6a8a98] border-transparent hover:bg-[#111618] hover:text-[#c8d8e0]"
        }`}
    >
      <span className="text-[10px] opacity-50">{icon}</span>
      <span className="truncate">{room.name}</span>
    </div>
  );
}