import { useState, useEffect } from "react";

export default function Toast({ connected, user, subscribe, addInvitation, onRoomClick}) {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    if (!connected || !user?.id) return;
  
    subscribe(`/topic/user.${user.id}`, (inv) => {
      const room = { id:inv.roomId, name: inv.roomName, type: "PRIVATE" };
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
    <div className="fixed bottom-5 right-5 flex flex-col gap-2 z-50">
      {toasts.map(t => (
        <div
          key={t.id}
          onClick={() => { onRoomClick(t.room); removeToast(t.id); }}
          className="bg-[#1a0e20] border border-purple-800 rounded-md px-4 py-3 max-w-xs cursor-pointer animate-[fadeUp_0.25s_ease] hover:border-purple-500 transition-colors"
        >
          <p className="text-[10px] tracking-widest uppercase text-purple-400 font-mono mb-1">
            🔒 Nueva invitación
          </p>
          <p className="text-[12px] text-[#c8d8e0] font-sans font-light">
            <span className="text-[#00d4aa]">{t.invitedBy}</span> te invitó a "{t.roomName}"
          </p>
          <p className="text-[10px] text-[#334450] font-mono mt-1">
            click para entrar
          </p>
        </div>
      ))}
    </div>
  );
}