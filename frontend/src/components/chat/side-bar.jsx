import { useNavigate } from "react-router-dom";

export default function Sidebar({
  user,
  connected,
  activeRoom,
  thematicRooms,
  privateRooms,
  invitationCount,
  onSwitchRoom,
  onLogout
}) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate("/login");
  }

  return (
    <aside className="w-60 min-w-60 bg-[#0d1214] border-r border-[#1c2428] flex flex-col overflow-hidden font-mono">
      
      {/* HEADER */}
      <div className="p-4 border-b border-[#1c2428] flex items-center gap-2">
        <div 
          className={`w-1.75 h-1.75 rounded-full transition-all duration-300 ${
            connected 
              ? "bg-[#00d4aa] shadow-[0_0_6px_#00d4aa]" 
              : "bg-[#334450]"
          }`} 
        />
        <span className="text-[11px] tracking-[0.15em] uppercase text-[#6a8a98] font-medium">
          realtime<span className="text-[#00d4aa]">/</span>chat
        </span>
      </div>

      {/* GLOBAL */}
      <div className="py-2.5 border-b border-[#1c2428]">
        <div className="text-1.5 tracking-[0.2em] uppercase text-[#334450] px-4 pb-1.5 font-medium">
          Global
        </div>
        <div
          className={`${roomBaseClass} ${
            activeRoom.type === "GLOBAL" ? roomActiveClass : roomInactiveClass
          }`}
          onClick={() => onSwitchRoom({ id: 1, name: "Global Room", type: "GLOBAL" })}
        >
          <span className="text-1.25 opacity-50">#</span>
          Global Room
        </div>
      </div>

      {/* TEMÁTICAS */}
      <div className="py-2.5 border-b border-[#1c2428] flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[#1c2428]">
        <div className="text-1.25 tracking-[0.2em] uppercase text-[#334450] px-4 pb-1.5 font-medium">
          Temáticas
        </div>
        {thematicRooms.length === 0 ? (
          <div className="py-2.5 px-4 text-[11px] text-[#2a3d48]">sin salas temáticas</div>
        ) : (
          thematicRooms.map((r) => (
            <div
              key={r.id}
              className={`${roomBaseClass} ${
                activeRoom.id === r.id ? roomActiveClass : roomInactiveClass
              }`}
              onClick={() => onSwitchRoom(r)}
            >
              <span className="text-1.25 opacity-50">#</span>
              {r.name}
            </div>
          ))
        )}
      </div>

      {/* PRIVADAS */}
      <div className="py-2.5 border-b border-[#1c2428] max-h-45 overflow-y-auto">
        <div className="text-1.25 tracking-[0.2em] uppercase text-[#334450] px-4 pb-1.5 font-medium flex justify-between items-center">
          Privadas
          {invitationCount > 0 && (
            <span className="bg-[#c080e0] text-white text-[9px] font-medium px-1.5 py-px rounded-full">
              {invitationCount}
            </span>
          )}
        </div>
        {privateRooms.length === 0 ? (
          <div className="py-2.5 px-4 text-[11px] text-[#2a3d48]">sin salas privadas</div>
        ) : (
          privateRooms.map((r) => (
            <div
              key={r.id}
              className={`${roomBaseClass} ${
                activeRoom.id === r.id ? roomActiveClass : roomInactiveClass
              }`}
              onClick={() => onSwitchRoom(r)}
            >
              <span className="text-[10px] opacity-50">🔒</span>
              {r.name}
            </div>
          ))
        )}
      </div>

      {/* FOOTER */}
      <div className="mt-auto p-4 border-top border-[#1c2428] flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <div className="w-6.5 h-6.5 rounded-full bg-[#012820] border border-[#007a60] flex items-center justify-center text-[11px] text-[#00d4aa] font-semibold shrink-0">
            {user?.username?.[0]?.toUpperCase() ?? "?"}
          </div>
          <span className="text-[12px] text-[#c8d8e0] flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
            {user?.username ?? "—"}
          </span>
        </div>
        <button 
          className="bg-transparent border border-[#1c2428] text-[#334450] text-[10px] py-1.25 px-2.5 rounded-[3px] cursor-pointer tracking-wider transition-all hover:border-[#e05060] hover:text-[#e05060] hover:bg-[#200810] text-left mt-0.5" 
          onClick={handleLogout}
        >
          → logout
        </button>
      </div>

    </aside>
  );
}