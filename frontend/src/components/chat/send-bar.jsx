import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useRef, useState } from "react";
import { useAuth } from "../../hooks/use-auth";

const API = "http://localhost:8080";

const FORMAT_BUTTONS = [
  { label: "B", title: "Negrita", action: (e) => e.chain().focus().toggleBold().run(), active: (e) => e.isActive("bold"), style: "font-bold" },
  { label: "I", title: "Cursiva", action: (e) => e.chain().focus().toggleItalic().run(), active: (e) => e.isActive("italic"), style: "italic" },
  { label: "</>", title: "Código", action: (e) => e.chain().focus().toggleCode().run(), active: (e) => e.isActive("code"), style: "font-mono text-[11px]" },
];

export default function SendBar({ onSend, disabled, onTyping }) {
  const { token } = useAuth();

  const [isEmpty, setIsEmpty] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [filePreview, setFilePreview] = useState(null);
  const [recording, setRecording] = useState(false);
  const [audioPreview, setAudioPreview] = useState(null);

  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const editor = useEditor({
    extensions: [StarterKit],
    editorProps: {
      attributes: {
        // CAMBIO: Estilos adaptados al input burbuja de Telegram
        class: "outline-none min-h-[22px] max-h-[140px] overflow-y-auto text-[14px] font-sans text-[#f5f5f5] px-1 py-1.5 placeholder-[#52677a]",
      },
      handleKeyDown(view, event) {
        if (event.key === "Enter" && !event.shiftKey) {
          event.preventDefault();
          handleSend();
          return true;
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      setIsEmpty(editor.isEmpty);
      onTyping?.();
    },
  });

  // ── UPLOAD ────────────────────────────────────────────────────────────
  async function uploadFileBlob(blobOrFile, fileName) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", blobOrFile, fileName);

      const res = await fetch(`${API}/api/upload`, {
        method: "POST",
        headers: { Authorization: "Bearer " + token },
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();

      if (data.messageType === "AUDIO" || fileName.endsWith(".webm") || fileName.endsWith(".mp3")) {
        setAudioPreview({
          url: data.url,
          name: fileName,
          resourceType: "AUDIO",
        });
      } else {
        setFilePreview({
          url: data.url,
          name: fileName,
          resourceType: data.messageType,
        });
      }
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
    }
  }
  
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    await uploadFileBlob(file, file.name);
    e.target.value = ""; 
  };

  const removeFile = () => setFilePreview(null);
  const removeAudio = () => setAudioPreview(null);

  // ── AUDIO RECORDING ───────────────────────────────────────────────────
  const startRecording = async (e) => {
    e.preventDefault();
    if (disabled || uploading || audioPreview) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const fileName = `audio_${Date.now()}.webm`;
        stream.getTracks().forEach(track => track.stop());
        await uploadFileBlob(audioBlob, fileName);
      };

      mediaRecorderRef.current.start();
      setRecording(true);
    } catch (err) {
      console.error("Error al acceder al micrófono:", err);
    }
  };

  const stopRecording = (e) => {
    e.preventDefault();
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  // ── SEND ──────────────────────────────────────────────────────────────
  const handleSend = () => {
    if (!editor) return;
    if (editor.isEmpty && !filePreview && !audioPreview) return;

    if (filePreview) {
      onSend({
        content: editor.isEmpty ? "" : editor.getHTML(),
        messageType: filePreview.resourceType,
        fileUrl: filePreview.url,
        fileName: filePreview.name,
      });
      setFilePreview(null);
    } else if (audioPreview) {
      onSend({
        content: "",
        messageType: "AUDIO",
        fileUrl: audioPreview.url,
        fileName: audioPreview.name,
      });
      setAudioPreview(null);
    } else {
      onSend({
        content: editor.getHTML(),
        messageType: "TEXT",
        fileUrl: null,
        fileName: null,
      });
    }

    editor.commands.clearContent();
    setIsEmpty(true);
  };

  return (
    // CAMBIO: Fondo integrado al chat (#0e1621), sin borde tosco superior sino división sutil
    <div className="border-t border-[#101921] bg-[#0e1621] shrink-0 px-4 py-2 font-sans flex flex-col gap-1.5">

      {/* PREVIEW DE IMAGEN O VÍDEO (Estilo adjunto elegante flotante) */}
      {filePreview && (
        <div className="mx-2 flex items-center gap-3 px-3 py-2 bg-[#17212b] border border-[#202b36] rounded-xl animate-[fadeUp_0.15s_ease]">
          {filePreview.resourceType === "image" ? (
            <img src={filePreview.url} alt={filePreview.name} className="w-12 h-12 object-cover rounded-lg" />
          ) : (
            <video src={filePreview.url} className="w-12 h-12 object-cover rounded-lg" />
          )}
          <div className="flex flex-col gap-0.5 flex-1 min-w-0">
            <span className="text-[13px] text-[#f5f5f5] font-medium truncate">{filePreview.name}</span>
            <span className="text-[11px] text-[#708499] uppercase tracking-wide">{filePreview.resourceType}</span>
          </div>
          <button onClick={removeFile} className="text-[#708499] hover:text-[#ef476f] transition-colors text-xl p-1 cursor-pointer">
            ×
          </button>
        </div>
      )}

      {/* PREVIEW DEL AUDIO */}
      {audioPreview && (
        <div className="mx-2 flex items-center gap-3 px-3 py-2 bg-[#17212b] border border-[#202b36] rounded-xl animate-[fadeUp_0.15s_ease]">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#2481cc] text-white text-[12px]">
            🎤
          </div>
          <div className="flex-1 min-w-0 flex items-center">
            <audio src={audioPreview.url} controls className="w-full h-8 custom-audio" />
          </div>
          <button onClick={removeAudio} className="text-[#708499] hover:text-[#ef476f] transition-colors text-xl p-1 cursor-pointer">
            ×
          </button>
        </div>
      )}

      {/* FILA DE ENTRADA PRINCIPAL + BOTONES */}
      <div className="flex items-end gap-2.5">
        
        {/* CONTENEDOR DE ENTRADA GLOBAL (Burbuja Unificada de Telegram Desktop) */}
        <div className="flex-1 bg-[#17212b] border border-[#202b36] rounded-xl flex flex-col focus-within:border-[#2b5278] transition-colors">
          
          {/* BARRA DE HERRAMIENTAS INTERNA */}
          <div className="flex items-center gap-1.5 px-3 pt-2 pb-1 border-b border-[rgba(255,255,255,0.03)]">
            {FORMAT_BUTTONS.map(btn => (
              <button key={btn.label} onClick={() => editor && btn.action(editor)}
                title={btn.title} disabled={disabled || !editor}
                className={`px-2 py-0.5 text-[12px] font-medium rounded transition-all disabled:opacity-30 cursor-pointer ${btn.style}
                  ${editor && btn.active(editor)
                    ? "text-[#2481cc] bg-[rgba(36,129,204,0.12)]"
                    : "text-[#708499] hover:text-[#f5f5f5]"
                  }`}>
                {btn.label}
              </button>
            ))}

            <div className="w-px h-3 bg-[#202b36] mx-1" />

            {/* Adjuntar Archivo */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || uploading}
              title="Adjuntar archivo o imagen"
              className="p-1 text-[#708499] hover:text-[#2481cc] transition-all disabled:opacity-30 cursor-pointer text-[13px]"
            >
              {uploading && !recording ? "⏳" : "📎"}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*, video/*, application/pdf" onChange={handleFileChange} className="hidden" />

            {/* Micrófono Nota de Voz */}
            <button
              onMouseDown={startRecording} onMouseUp={stopRecording} onMouseLeave={stopRecording}
              onTouchStart={startRecording} onTouchEnd={stopRecording}
              disabled={disabled || uploading || !!audioPreview}
              title="Mantén pulsado para grabar"
              className={`px-2 py-0.5 text-[12px] font-medium rounded transition-all select-none touch-none cursor-pointer
                ${recording 
                  ? "text-[#ef476f] bg-[rgba(239,71,111,0.15)] animate-pulse" 
                  : "text-[#708499] hover:text-[#2481cc] disabled:opacity-30"
                }`}
            >
              {recording ? "🎙️ Recording..." : "🎙️ Voice"}
            </button>
          </div>

          {/* AREA DE TEXTO */}
          <div className="px-2 py-0.5 max-h-35">
            <EditorContent editor={editor} />
          </div>
        </div>

        {/* BOTÓN DE ENVIAR (Icono redondo estilo Telegram) */}
        <button
          onClick={handleSend}
          disabled={disabled || (isEmpty && !filePreview && !audioPreview)}
          className="w-10.5 h-10.5 shrink-0 rounded-full bg-[#2481cc] hover:bg-[#2893e6] disabled:bg-[#202b36] disabled:text-[#52677a] text-white flex items-center justify-center transition-all active:scale-95 disabled:cursor-not-allowed cursor-pointer shadow-md mb-0.5"
          title="Enviar mensaje"
        >
          {/* SVG de flecha/avión de papel clásico de mensajería */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="translate-x-px">
            <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* ATAJOS INFORMATIVOS ABAJO */}
      <p className="px-2 text-[11px] text-[#52677a] font-normal tracking-wide">
        <span className="font-semibold text-[#708499]">Enter</span> to send · <span className="font-semibold text-[#708499]">Shift+Enter</span> for new line · Hold <span className="font-semibold text-[#708499]">Voice</span> to record
      </p>
    </div>
  );
}