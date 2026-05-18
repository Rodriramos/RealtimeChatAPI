export default function RoomList({ thematicRooms, privateRooms, onEnter }) {
  const globalRoom = { id: 1, name: "Global Room", type: "GLOBAL" };

  return (
    // CAMBIO: Fondo oscuro oficial de chat (#0e1621)
    <div className="flex-1 overflow-y-auto bg-[#0e1621] font-sans">

      {/* CABECERA DE LA LISTA */}
      <div className="flex items-center px-6 py-3.5 border-b border-[#101921] bg-[#17212b]">
        <span className="text-[13px] text-[#5288c1] font-medium tracking-wide">
          Available Rooms & Channels
        </span>
      </div>

      {/* LISTA DE SALAS ESTILO TELEGRAM (Filas compactas e interactivas) */}
      <div className="flex flex-col divide-y divide-[#101921]">
        <RoomRow room={globalRoom} onEnter={onEnter} />
        {thematicRooms.map(r => <RoomRow key={r.id} room={r} onEnter={onEnter} />)}
        {privateRooms.map(r => <RoomRow key={r.id} room={r} onEnter={onEnter} />)}
      </div>

    </div>
  );
}

// Configuración de estilos para los Avatares/Badges basados en Telegram Modos
const ROOM_META = {
  GLOBAL: { label: "Global", icon: "🌐", bg: "bg-[#2481cc] text-white" },
  THEMATIC: { label: "Thematic", icon: "💬", bg: "bg-[#2b5278] text-[#80b1ea]" },
  PRIVATE: { label: "Private", icon: "🔒", bg: "bg-[#2f1f3a] text-purple-400" },
};

function RoomRow({ room, onEnter }) {
  const meta = ROOM_META[room.type] ?? { label: "Room", icon: "👥", bg: "bg-[#1d2a39] text-[#708499]" };

  return (
    // CAMBIO: Toda la fila es un botón interactivo, sin bordes de tarjeta individuales
    <div 
      onClick={() => onEnter(room)}
      className="flex items-center justify-between px-6 py-3.5 hover:bg-[#17212b] transition-colors cursor-pointer group"
    >
      <div className="flex items-center gap-3.5 min-w-0">
        
        {/* AVATAR ESTILO TELEGRAM (Círculo con icono/inicial) */}
        <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 text-lg font-medium shadow-sm ${meta.bg}`}>
          {meta.icon}
        </div>

        {/* INFORMACIÓN DE LA SALA */}
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-[14.5px] text-[#f5f5f5] font-medium group-hover:text-[#2481cc] transition-colors truncate">
            {room.name}
          </span>
          <span className="text-[12.5px] text-[#708499] font-normal">
            Click to join conversation
          </span>
        </div>
      </div>

      {/* DETALLES/BADGE DE TIPO DE SALA */}
      <div className="flex items-center gap-3">
        <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full ${
          room.type === 'GLOBAL' ? 'bg-[rgba(36,129,204,0.15)] text-[#2481cc]' :
          room.type === 'THEMATIC' ? 'bg-[rgba(82,136,193,0.15)] text-[#5288c1]' :
          'bg-[rgba(168,85,247,0.15)] text-purple-400'
        }`}>
          {meta.label}
        </span>
        
        {/* Icono flecha sutil indicador de acción */}
        <span className="text-[#52677a] group-hover:text-[#f5f5f5] transition-colors text-sm pr-1">
          ➔
        </span>
      </div>
    </div>
  );
}