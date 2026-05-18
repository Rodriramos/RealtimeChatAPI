export default function RoomTabs({ activeTab, onTabChange, invitationCount, activeRoomName }) {
  const tabs = [
    { id: "chat",        label: activeRoomName || "Chat" },
    { id: "rooms",       label: "All Rooms" },
    { id: "invitations", label: "Invitations", badge: invitationCount },
    { id: "create",      label: "+ New Room" },
  ];

  return (
    // CAMBIO: Eliminado el bloque de estatus, las pestañas ahora fluyen directamente desde el borde izquierdo
    <div className="flex border-b border-[#101921] bg-[#101921] shrink-0 h-13 items-stretch font-sans">

      {/* TABS - Estilo navegación superior limpia de Telegram */}
      <div className="flex items-stretch flex-1 overflow-x-auto px-2">
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-5 text-[13.5px] font-medium border-b-2 transition-all cursor-pointer bg-none border-t-0 border-l-0 border-r-0
                ${isActive
                  ? "text-[#2481cc] border-[#2481cc]" // Azul clásico de Telegram activo
                  : "text-[#708499] border-transparent hover:text-[#f5f5f5] hover:bg-[rgba(255,255,255,0.02)]"
                }`}
            >
              <span>{tab.label}</span>
              
              {/* BADGE - Contador de invitaciones estilo notificación circular */}
              {tab.badge > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-4.5 text-center transition-colors ${
                  isActive 
                    ? "bg-[#2481cc] text-white" 
                    : "bg-[#4cc37a] text-[#182533]"
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

    </div>
  );
}