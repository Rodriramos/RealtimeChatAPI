export default function RoomList({ thematicRooms, privateRooms, onEnter }) {
  const globalRoom = { id: 1, name: "Global Room", type: "GLOBAL" };

  return (
    <div className="flex-1 overflow-y-auto bg-[#080c0e]">

      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1c2428]">
        <span className="text-[11px] text-[#6a8a98] font-mono">
          Todas las salas disponibles
        </span>
      </div>

      <div className="p-4 flex flex-col gap-2">
        <RoomCard room={globalRoom} onEnter={onEnter} />
        {thematicRooms.map(r => <RoomCard key={r.id} room={r} onEnter={onEnter} />)}
        {privateRooms.map(r => <RoomCard key={r.id} room={r} onEnter={onEnter} />)}
      </div>

    </div>
  );
}

const BADGE = {
  GLOBAL: { label: "global", classes: "bg-[#012018] text-[#00d4aa] border-[#007a60]" },
  THEMATIC: { label: "temática", classes: "bg-[#0a1e28] text-[#4ab8d0] border-[#1a3a48]" },
  PRIVATE: { label: "privada", classes: "bg-[#1a0e20] text-purple-400 border-purple-900" },
};

function RoomCard({ room, onEnter }) {
  const badge = BADGE[room.type] ?? { label: room.type, classes: "bg-[#111618] text-[#6a8a98] border-[#1c2428]" };

  return (
    <div className="flex items-center justify-between bg-[#111618] border border-[#1c2428] rounded px-4 py-2.5 hover:border-[#243038] transition-colors">
      <div className="flex flex-col gap-0.5">
        <span className="text-[13px] text-[#c8d8e0] font-sans font-light">{room.name}</span>
        <span className="text-[10px] text-[#334450] font-mono">id: {room.id}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-[9px] tracking-widest uppercase px-2 py-px rounded-sm border font-mono font-medium ${badge.classes}`}>
          {badge.label}
        </span>
        <button
          onClick={() => onEnter(room)}
          className="text-[10px] text-[#6a8a98] border border-[#243038] bg-[#0d1214] px-3 py-1 rounded-sm font-mono hover:text-[#c8d8e0] hover:border-[#334450] transition-colors cursor-pointer"
        >
          Entrar
        </button>
      </div>
    </div>
  );
}