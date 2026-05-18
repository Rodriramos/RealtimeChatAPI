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
            <video
              src={msg.fileUrl}
              controls
              className="max-w-xs max-h-64 rounded-t-xl"
            />
          </div>
        )}

        {/* TEXT CONTENT */}
        {msg.content && (
          <div
            className="text-[14px] leading-relaxed wrap-break-words pr-8"
            dangerouslySetInnerHTML={{ __html: msg.content }}
          />
        )}

        {/* MULTIMEDIA CONTENT: PDF / FILE */}
        {msg.messageType === "FILE" && msg.fileUrl && (
          <a
            href={msg.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2.5 my-1 p-2 rounded-lg transition-colors bg-[rgba(0,0,0,0.15)]
              ${isMe ? "text-[#80b1ea] hover:text-[#a2c9f7]" : "text-[#5288c1] hover:text-[#73a3d4]"}`}
          >
            <span className="text-xl">📄</span>
            <span className="text-[13px] font-medium underline truncate max-w-45">
              {msg.fileName || "archivo"}
            </span>
          </a>
        )}

        <span className={`absolute bottom-1 right-2 text-[10px] select-none
          ${isMe ? "text-[#7ca2c7]" : "text-[#708499]"}`}
        >
          {time}
        </span>

      </div>
    </div>
  );
}