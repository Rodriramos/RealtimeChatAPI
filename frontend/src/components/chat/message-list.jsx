import { useEffect, useRef } from "react";

export default function MessageList({ messages, loading }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0e1621]">
        <span className="text-[14px] text-[#708499] font-medium animate-pulse">
          Loading messages...
        </span>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#0e1621] px-6 py-4 flex flex-col gap-3 font-sans">

      {messages.length === 0 && (
        <p className="text-[13px] text-[#52677a] self-center bg-[#17212b] px-4 py-1.5 rounded-full mt-8">
          No messages yet
        </p>
      )}

      {messages.map((msg, i) => (
        <MessageBubble key={msg.id ?? i} msg={msg} />
      ))}

      <div ref={bottomRef} />
    </div>
  );
}

function MessageBubble({ msg }) {
  console.log("msg:", msg.messageType, msg.fileUrl, msg.fileName);
  const time = msg.sentAt || msg.createdAt
    ? new Date(msg.sentAt ?? msg.createdAt).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    })
    : "";

  const isMe = !msg.isHistory;

  return (
    <div className={`flex flex-col w-full animate-[fadeUp_0.15s_ease] ${isMe ? "items-end" : "items-start"}`}>
      <div className={`inline-block max-w-[75%] rounded-2xl px-3 py-2 relative shadow-sm overflow-hidden
        ${isMe
          ? "bg-[#2b5278] text-white rounded-tr-none"
          : "bg-[#182533] text-[#f5f5f5] rounded-tl-none"
        }`}
      >

        {/* SENDER NAME */}
        {!isMe && (
          <p className="text-[12.5px] font-semibold text-[#5288c1] mb-1 leading-none">
            {msg.senderUsername}
          </p>
        )}

        {/* IMAGE */}
        {msg.messageType === "IMAGE" && msg.fileUrl && (
          <div className="-mx-3 -mt-2 mb-1">
            <img
              src={msg.fileUrl}
              alt={msg.fileName || "imagen"}
              className="max-w-xs max-h-64 object-cover cursor-pointer hover:opacity-90 transition-opacity rounded-t-xl"
              onClick={() => window.open(msg.fileUrl, "_blank")}
            />
          </div>
        )}

        {/* VIDEO */}
        {msg.messageType === "VIDEO" && msg.fileUrl && (
          <div className="-mx-3 -mt-2 mb-1">
            <video src={msg.fileUrl} controls className="max-w-xs max-h-64 rounded-t-xl" />
          </div>
        )}

        {/* AUDIO */}
        {msg.messageType === "AUDIO" && msg.fileUrl && (
          <div className="flex items-center gap-2 my-1 py-1">
            <span className="text-lg">🎤</span>
            <audio src={msg.fileUrl} controls className="h-8 w-52" />
          </div>
        )}

        {/* PDF / FILE */}
        {msg.messageType === "FILE" && msg.fileUrl && (
          <div
            onClick={() => {
              const proxyUrl = `http://localhost:8080/api/files/download?url=${encodeURIComponent(msg.fileUrl)}&fileName=${encodeURIComponent(msg.fileName || "documento.pdf")}`;
              const a = document.createElement("a");
              a.href = proxyUrl;
              a.download = msg.fileName || "documento.pdf";
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
            }}
            className={`flex items-center gap-3 my-1 p-3 rounded-xl transition-colors cursor-pointer
      ${isMe
                ? "bg-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.13)]"
                : "bg-[rgba(0,0,0,0.2)] hover:bg-[rgba(0,0,0,0.28)]"
              }`}
          >
            <div className="w-11 h-11 rounded-xl bg-[#ef476f] flex flex-col items-center justify-center shrink-0 shadow-sm">
              <span className="text-white text-[10px] font-black tracking-wide leading-none">PDF</span>
              <div className="w-5 h-px bg-[rgba(255,255,255,0.4)] my-0.5" />
              <span className="text-[rgba(255,255,255,0.7)] text-[8px]">DOC</span>
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className={`text-[13px] font-semibold truncate leading-snug ${isMe ? "text-white" : "text-[#f5f5f5]"}`}>
                {msg.fileName || "documento.pdf"}
              </span>
              <span className="text-[11px] text-[#708499] mt-0.5">Toca para descargar</span>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0 text-[#708499]">
              <path d="M12 15V3M12 15l-4-4M12 15l4-4M3 19h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}

        {/* TEXT */}
        {msg.content && (
          <div
            className="text-[14px] leading-relaxed wrap-break-words pr-8"
            dangerouslySetInnerHTML={{ __html: msg.content }}
          />
        )}

        <span className={`absolute bottom-1 right-2 text-[10px] select-none
          ${isMe ? "text-[#7ca2c7]" : "text-[#708499]"}`}
        >
          {time}
        </span>

      </div>
    </div >
  );
}