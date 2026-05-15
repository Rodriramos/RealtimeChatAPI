import { useState } from "react";

export default function SendBar({ onSend, disabled }) {
  const [content, setContent] = useState("");

  const handleSend = () => {
    if (content.trim() === "") return;
    onSend(content.trim());
    setContent("");
  };

  return (
    <div className="flex gap-2 px-4 py-2.5 border-t border-[#1c2428] bg-[#0d1214] shrink-0">
      <input
        type="text"
        value={content}
        onChange={e => setContent(e.target.value)}
        onKeyDown={e => e.key === "Enter" && handleSend()}
        disabled={disabled}
        placeholder={disabled ? "Conectando..." : "Escribe un mensaje..."}
        className="flex-1 bg-[#111618] border border-[#243038] text-[#c8d8e0] font-sans text-[13px] font-light px-3 py-2 rounded-sm outline-none placeholder-[#334450] transition-colors focus:border-[#007a60] disabled:opacity-40 disabled:cursor-not-allowed"
      />
      <button
        onClick={handleSend}
        disabled={disabled || !content.trim()}
        className="px-4 py-2 bg-[#012820] border border-[#007a60] text-[#00d4aa] font-mono text-[11px] tracking-wide rounded-sm transition-all hover:bg-[#013d30] hover:border-[#00d4aa] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
      >
        Enviar
      </button>
    </div>
  )
}