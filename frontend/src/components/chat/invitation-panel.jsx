export default function InvitationPanel({ invitations, onAccept, onMarkSeen }) {
  return (
    <div className="flex-1 overflow-y-auto bg-[#080c0e]">

      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1c2428]">
        <span className="text-[11px] text-[#6a8a98] font-mono">
          Invitaciones pendientes
        </span>
        {invitations.length > 0 && (
          <button
            onClick={onMarkSeen}
            className="text-[10px] text-purple-400 border border-purple-900 bg-[#1a0e20] px-3 py-1 rounded-sm font-mono tracking-wide hover:border-purple-500 transition-colors cursor-pointer"
          >
            ✓ Marcar todas como vistas
          </button>
        )}
      </div>

      <div className="p-4 flex flex-col gap-3">
        {invitations.length === 0 ? (
          <p className="text-[12px] text-[#334450] font-mono text-center py-8">
            // sin invitaciones pendientes
          </p>
        ) : (
          invitations.map(r => (
            <div
              key={r.id}
              className="flex items-center justify-between bg-[#0e0814] border border-[#2a1540] rounded px-4 py-3 animate-[fadeUp_0.2s_ease]"
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-[13px] text-[#c8d8e0] font-sans font-light">
                  🔒 {r.name}
                </span>
                <span className="text-[10px] text-[#334450] font-mono">id: {r.id}</span>
              </div>
              <button
                onClick={() => onAccept(r)}
                className="text-[10px] text-purple-400 border border-purple-900 bg-[#1a0e20] px-3 py-1.5 rounded-sm font-mono tracking-wide hover:border-purple-500 transition-colors cursor-pointer"
              >
                Entrar
              </button>
            </div>
          ))
        )}
      </div>

    </div>
  );
}