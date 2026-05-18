export default function InvitationPanel({ invitations, onAccept, onMarkSeen }) {
  return (
    // CAMBIO: Fondo oscuro nativo de Telegram (#0e1621)
    <div className="flex-1 overflow-y-auto bg-[#0e1621] font-sans">

      {/* CABECERA AL ESTILO TELEGRAM */}
      <div className="flex items-center justify-between px-6 py-3.5 border-b border-[#101921] bg-[#17212b]">
        <span className="text-[13px] text-[#5288c1] font-medium tracking-wide">
          Pending Invitations
        </span>
        {invitations.length > 0 && (
          <button
            onClick={onMarkSeen}
            className="text-[12px] text-[#2481cc] hover:text-[#2893e6] font-medium transition-colors cursor-pointer bg-none border-0 px-1 py-0.5"
          >
            Mark all as seen
          </button>
        )}
      </div>

      {/* CUERPO PRINCIPAL */}
      <div className="flex flex-col divide-y divide-[#101921]">
        {invitations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <span className="text-4xl mb-3 opacity-40">📬</span>
            <p className="text-[14px] text-[#708499] max-w-xs leading-relaxed">
              No pending invitations at the moment. You're all caught up!
            </p>
          </div>
        ) : (
          invitations.map(r => (
            // CAMBIO: Filas fluidas interactivas en lugar de tarjetas aisladas
            <div
              key={r.id}
              className="flex items-center justify-between px-6 py-4 bg-transparent hover:bg-[#17212b] transition-colors group animate-[fadeUp_0.15s_ease]"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                
                {/* AVATAR DE INVITACIÓN (Círculo estético Telegram Privado) */}
                <div className="w-11 h-11 rounded-full bg-[#2f1f3a] text-purple-400 flex items-center justify-center shrink-0 text-lg font-medium shadow-sm">
                  ✉️
                </div>

                {/* DETALLES DE LA SALA */}
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-[14.5px] text-[#f5f5f5] font-medium group-hover:text-[#2481cc] transition-colors truncate">
                    {r.name}
                  </span>
                  <span className="text-[12.5px] text-[#708499] font-normal">
                    You have been invited to this private room
                  </span>
                </div>
              </div>

              {/* ACCIÓN (Botón compacto azul Telegram) */}
              <button
                onClick={() => onAccept(r)}
                className="px-4 py-1.5 bg-[#2481cc] hover:bg-[#2893e6] text-white text-[13px] font-medium rounded-lg shadow-sm transition-all active:scale-95 cursor-pointer shrink-0"
              >
                Accept
              </button>
            </div>
          ))
        )}
      </div>

    </div>
  );
}