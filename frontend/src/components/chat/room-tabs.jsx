export default function RoomTabs({ activeTab, onTabChange, invitationCount, activeRoomName, connected }) {
  const tabs = [
    { id: "chat",        label: activeRoomName || "Chat" },
    { id: "rooms",       label: "Salas" },
    { id: "invitations", label: "Invitaciones", badge: invitationCount },
    { id: "create",      label: "+ Sala Privada" },
  ];

  return (
    <div className="flex border-b border-[#1c2428] bg-[#0d1214] shrink-0">

      {/* STATUS */}
      <div className="flex items-center px-4 border-r border-[#1c2428]">
        <span className={`text-[10px] font-mono tracking-widest ${
          connected ? "text-[#007a60]" : "text-[#334450]"
        }`}>
          {connected ? "● live" : "○ offline"}
        </span>
      </div>

      {/* TABS */}
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-[10px] font-mono tracking-widest uppercase border-b-2 transition-all cursor-pointer bg-none border-t-0 border-l-0 border-r-0
            ${activeTab === tab.id
              ? "text-[#00d4aa] border-[#00d4aa]"
              : "text-[#334450] border-transparent hover:text-[#6a8a98]"
            }`}
        >
          {tab.label}
          {tab.badge > 0 && (
            <span className="bg-purple-500 text-white text-[9px] font-medium px-1.5 py-px rounded-full">
              {tab.badge}
            </span>
          )}
        </button>
      ))}

    </div>
  )
}