export default function RoomTabs({ activeTab, onTabChange, invitationCount, activeRoomName }) {
  const tabs = [
    { id: "chat",        label: activeRoomName || "Chat", icon: "💬" },
    { id: "rooms",       label: "Salas", icon: "🌐" },
    { id: "invitations", label: "Invitaciones", icon: "📩", badge: invitationCount },
  ];

  return (
    <div className="flex border-b border-[#101921] bg-[#101921]/95 backdrop-blur-md shrink-0 h-13 items-center justify-between font-sans px-4 select-none">

      {/* TAB LIST */}
      <div className="flex items-stretch h-full gap-1 overflow-x-auto scrollbar-none">
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 text-[13.5px] font-medium transition-all duration-150 relative cursor-pointer group h-full
                ${isActive
                  ? "text-[#2481cc]"
                  : "text-[#708499] hover:text-[#f5f5f5]"
                }`}
            >
              <span className={`text-[14px] transition-transform duration-150 group-hover:scale-110 ${
                isActive ? "opacity-100" : "opacity-60 group-hover:opacity-100"
              }`}>
                {tab.icon}
              </span>

              <span>{tab.label}</span>
              
              {/* NOTIFICATION BADGE */}
              {tab.badge > 0 && (
                <span className={`text-[10px] font-bold h-4.5 min-w-4.5 px-1 rounded-full flex items-center justify-center transition-colors shadow-sm ${
                  isActive 
                    ? "bg-[#2481cc] text-white" 
                    : "bg-[#e53935] text-white animate-[pulse_2s_infinite]"
                }`}>
                  {tab.badge}
                </span>
              )}

              {isActive && (
                <div className="absolute bottom-0 left-2 right-2 h-0.75 bg-[#2481cc] rounded-t-full shadow-[0_-2px_8px_rgba(36,129,204,0.5)] animate-[fadeIn_0.15s_ease]" />
              )}
            </button>
          );
        })}
      </div>

      {/* CREATE ROOM BUTTON */}
      <button
        onClick={() => onTabChange("create")}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12.5px] font-semibold tracking-wide transition-all duration-150 cursor-pointer active:scale-95 shadow-sm
          ${activeTab === "create"
            ? "bg-[#2481cc] text-white shadow-[#2481cc]/20"
            : "bg-[#17212b] border border-[#202b36] text-[#5288c1] hover:bg-[#202b36] hover:text-[#f5f5f5]"
          }`}
      >
        <span className="text-[14px] font-bold">+</span>
        <span className="hidden sm:inline">Crear Sala Privada</span>
      </button>

    </div>
  );
}