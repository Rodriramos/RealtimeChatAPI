import { useState, useEffect } from "react";

export default function Toast({ connected, user, subscribe, addInvitation, onRoomClick }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    if (!connected || !user?.id) return;
  
    subscribe(`/topic/user.${user.id}`, (inv) => {
      const room = { id: inv.roomId, name: inv.roomName, type: "PRIVATE" };
      addInvitation(room);
      addToast(inv.invitedBy, inv.roomName, room);
    });
  }, [connected, user?.id]);

  const addToast = (invitedBy, roomName, room) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, invitedBy, roomName, room }]);
    setTimeout(() => removeToast(id), 6000);
  };

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-100 max-w-sm font-sans">
      {toasts.map(t => (
        <div
          key={t.id}
          onClick={() => { onRoomClick(t.room); removeToast(t.id); }}
          className="bg-[#17212b]/df border border-[#202b36] rounded-2xl px-4 py-3.5 cursor-pointer shadow-2xl animate-[fadeUp_0.2s_ease] hover:bg-[#202b36] transition-all duration-200 flex gap-3 items-start backdrop-blur-sm select-none"
        >
          {/* NOTIFICATION ICON */}
          <div className="w-9 h-9 rounded-full bg-[rgba(36,129,204,0.15)] text-[#2481cc] flex items-center justify-center shrink-0 text-base shadow-sm">
            📩
          </div>

          {/* NOTIFICATION BODY */}
          <div className="flex flex-col gap-0.5 flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[13px] font-semibold text-[#2481cc]">
                New Invitation
              </span>
              <span className="text-[11px] text-[#52677a]">now</span>
            </div>
            
            <p className="text-[13.5px] text-[#f5f5f5] leading-snug wrap-break-words">
              <span className="font-semibold text-[#5288c1]">{t.invitedBy}</span> invited you to <span className="italic font-medium">"{t.roomName}"</span>
            </p>
            
            <span className="text-[11px] text-[#708499] mt-1 flex items-center gap-1 font-medium">
              Click to join conversation ➔
            </span>
          </div>

        </div>
      ))}
    </div>
  );
}