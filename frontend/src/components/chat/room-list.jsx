import { useState } from "react";

export default function RoomList({ thematicRooms = [], privateRooms = [], onEnter }) {
  const globalRoom = { id: 1, name: "Global Room", type: "GLOBAL" };
  const [activeRoomId, setActiveRoomId] = useState(1);

  const handleRoomClick = (room) => {
    setActiveRoomId(room.id);
    onEnter?.(room);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#0e1621] font-sans scrollbar-thin scrollbar-thumb-[#17212b]">

      {/* HEADER */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#101921] bg-[#17212b]/80 backdrop-blur-md sticky top-0 z-10">
        <span className="text-[13px] text-[#5288c1] font-semibold tracking-wider uppercase">
          Salas y Canales
        </span>
        <span className="text-[11px] bg-[#202b36] text-[#708499] px-2 py-0.5 rounded-md font-medium">
          {1 + thematicRooms.length + privateRooms.length} activas
        </span>
      </div>

      {/* ROOM LIST */}
      <div className="flex flex-col py-1">
        <RoomRow 
          room={globalRoom} 
          isActive={activeRoomId === globalRoom.id} 
          onClick={() => handleRoomClick(globalRoom)} 
        />
        
        {thematicRooms.map(r => (
          <RoomRow 
            key={r.id} 
            room={r} 
            isActive={activeRoomId === r.id} 
            onClick={() => handleRoomClick(r)} 
          />
        ))}
        
        {privateRooms.map(r => (
          <RoomRow 
            key={r.id} 
            room={r} 
            isActive={activeRoomId === r.id} 
            onClick={() => handleRoomClick(r)} 
          />
        ))}
      </div>

    </div>
  );
}

const ROOM_META = {
  GLOBAL: { label: "Global", icon: "🌐", bg: "from-[#2a7abe] to-[#2481cc] text-white" },
  THEMATIC: { label: "Temática", icon: "💬", bg: "from-[#2b5278] to-[#366391] text-[#b3d4fc]" },
  PRIVATE: { label: "Privada", icon: "🔒", bg: "from-[#2f1f3a] to-[#44285a] text-[#d8b4fe]" },
};

function RoomRow({ room, isActive, onClick }) {
  const meta = ROOM_META[room.type] ?? { label: "Sala", icon: "👥", bg: "from-[#1d2a39] to-[#253548] text-[#708499]" };

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : "RM";
  };

  return (
    <div 
      onClick={onClick}
      className={`flex items-center justify-between mx-2 my-0.5 px-4 py-3 rounded-xl transition-all duration-150 cursor-pointer group relative ${
        isActive 
          ? "bg-[#2481cc] shadow-md shadow-[#2481cc]/10" 
          : "hover:bg-[#17212b] active:bg-[#131b24]"
      }`}
    >
      {isActive && (
        <div className="absolute left-0 top-1/4 h-1/2 w-1 bg-white rounded-r-full animate-[fadeIn_0.2s_ease]" />
      )}

      <div className="flex items-center gap-3.5 min-w-0">
        <div className={`w-11 h-11 rounded-full bg-linear-to-tr flex items-center justify-center shrink-0 shadow-inner relative font-semibold text-[14px] tracking-wider select-none ${
          isActive ? "bg-white/10 text-white border border-white/20" : meta.bg
        }`}>

          {room.type === 'GLOBAL' ? meta.icon : getInitials(room.name)}

          <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#0e1621] ${
            room.type === 'GLOBAL' ? 'bg-green-400' : 'bg-amber-400'
          }`} />
        </div>

        {/* ROOM INFO */}
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className={`text-[14.5px] font-medium transition-colors truncate ${
            isActive ? "text-white" : "text-[#f5f5f5] group-hover:text-[#2481cc]"
          }`}>
            {room.name}
          </span>
          <span className={`text-[12.5px] font-normal transition-colors truncate ${
            isActive ? "text-white/75" : "text-[#708499]"
          }`}>
            {room.type === 'GLOBAL' ? 'Chat general abierto' : `Unirse a sala ${meta.label.toLowerCase()}`}
          </span>
        </div>
      </div>

      {/* BADGES AND COUNTERS */}
      <div className="flex items-center gap-2.5 shrink-0">

        {!isActive && (
          <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md ${
            room.type === 'GLOBAL' ? 'bg-[rgba(36,129,204,0.12)] text-[#2481cc]' :
            room.type === 'THEMATIC' ? 'bg-[rgba(82,136,193,0.12)] text-[#5288c1]' :
            'bg-[rgba(168,85,247,0.12)] text-purple-400'
          }`}>
            {meta.label}
          </span>
        )}

        <span className={`text-[11px] font-bold min-w-5 h-5 px-1.5 rounded-full flex items-center justify-center transition-all ${
          isActive 
            ? "bg-white text-[#2481cc]" 
            : "bg-[#2481cc] text-white opacity-90 group-hover:opacity-100 shadow-[0_2px_5px_rgba(36,129,204,0.2)]"
        }`}>
          {room.type === 'GLOBAL' ? '99+' : room.id * 2}
        </span>
      </div>
    </div>
  );
}