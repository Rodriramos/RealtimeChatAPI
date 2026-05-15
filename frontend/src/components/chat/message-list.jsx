import { useEffect, useRef } from "react";

export default function MessageList({ messages, loading }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#080c0e]">
        <span className="text-[11px] text-[#334450] font-mono tracking-widest animate-pulse">
          // loading messages... //
        </span>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#080c0e] px-4 py-3 flex flex-col gap-2">

      {messages.length === 0 && (
        <p className="text-[11px] text-[#334450] font-mono self-center mt-8">
          // no messages yet... //
        </p>
      )}

      {messages.map((msg, i) => (
        <MessageBubble key={msg.id ?? i} msg={msg} />
      ))}

      {/* Autoscroll */}
      <div ref={bottomRef} />
    </div>
  );
}

function MessageBubble({ msg }) {
  const time = msg.sentAt || msg.createdAt ? new Date(msg.sentAt ?? msg.createdAt)
    .toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }) : "";

  return (
    <div className="flex flex-col gap-0.5 animate-[fadeUp_0.2s_ease]">
      <div className="flex items-baseline gap-2">
        <span className={`text-[10px] font-semibold font-mono ${
          msg.isHistory ? "text-[#007a60]" : "text-[#00d4aa]"
        }`}>
          {msg.senderUsername}
        </span>
        <span className="text-[10px] text-[#334450] font-mono">{time}</span>
      </div>
      <div className={`inline-block max-w-[85%] text-[12.5px] leading-relaxed px-2.5 py-1.5 rounded-tr rounded-br rounded-bl font-sans font-light ${
        msg.isHistory
          ? "bg-[#0d1214] border border-[#1c2428] text-[#6a8a98]"
          : "bg-[#111618] border border-[#1c2428] text-[#c8d8e0]"
      }`}>
        {msg.content}
      </div>
    </div>
  )
}