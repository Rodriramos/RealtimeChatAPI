import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useRef, useState, useEffect } from "react";
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
  const [showMenu, setShowMenu] = useState(false);

  const fileInputRef = useRef(null);
  const pdfInputRef = useRef(null);
  const menuRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const editor = useEditor({
    extensions: [StarterKit],
    editorProps: {
      attributes: {
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
    setShowMenu(false);
    try {
      const formData = new FormData();
      formData.append("file", blobOrFile, fileName);
      
      const res = await fetch(`${API}/api/files/upload`, {
        method: "POST",
        headers: { Authorization: "Bearer " + token },
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();

      if (data.messageType === "AUDIO" || fileName.endsWith(".webm") || fileName.endsWith(".mp3")) {
        setAudioPreview({ url: data.url, name: fileName, resourceType: "AUDIO" });
      } else {
        setFilePreview({ url: data.url, name: fileName, resourceType: data.messageType });
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
  const toggleRecording = (e) => {
    e.preventDefault();

    if (recording) {
      // Parar grabación
      if (!mediaRecorderRef.current) return;
      mediaRecorderRef.current.requestData();
      mediaRecorderRef.current.stop();
      setRecording(false);
    } else {
      // Iniciar grabación
      if (disabled || uploading || audioPreview) return;

      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          mediaRecorderRef.current = new MediaRecorder(stream);
          audioChunksRef.current = [];

          mediaRecorderRef.current.ondataavailable = (event) => {
            if (event.data.size > 0) audioChunksRef.current.push(event.data);
          };

          mediaRecorderRef.current.onstop = async () => {
            stream.getTracks().forEach(track => track.stop());
            if (audioChunksRef.current.length === 0) return;
            const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
            if (audioBlob.size < 1000) return;
            const fileName = `audio_${Date.now()}.webm`;
            await uploadFileBlob(audioBlob, fileName);
          };

          mediaRecorderRef.current.start(250);
          setRecording(true);
        })
        .catch(err => console.error("Error al acceder al micrófono:", err));
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
      onSend({ content: "", messageType: "AUDIO", fileUrl: audioPreview.url, fileName: audioPreview.name });
      setAudioPreview(null);
    } else {
      onSend({ content: editor.getHTML(), messageType: "TEXT", fileUrl: null, fileName: null });
    }

    editor.commands.clearContent();
    setIsEmpty(true);
  };

  return (
    <div className="border-t border-[#101921] bg-[#0e1621] shrink-0 px-4 py-2 font-sans flex flex-col gap-1.5 relative">

      {/* FILE PREVIEW */}
      {filePreview && (
        <div className="mx-2 flex items-center gap-3 px-3 py-2 bg-[#17212b] border border-[#202b36] rounded-xl animate-[fadeUp_0.15s_ease]">
          {filePreview.resourceType === "IMAGE" ? (
            <img src={filePreview.url} alt={filePreview.name} className="w-12 h-12 object-cover rounded-lg" />
          ) : (
            <video src={filePreview.url} className="w-12 h-12 object-cover rounded-lg" />
          )}
          <div className="flex flex-col gap-0.5 flex-1 min-w-0">
            <span className="text-[13px] text-[#f5f5f5] font-medium truncate">{filePreview.name}</span>
            <span className="text-[11px] text-[#708499] uppercase tracking-wide">{filePreview.resourceType}</span>
          </div>
          <button onClick={removeFile} className="text-[#708499] hover:text-[#ef476f] transition-colors text-xl p-1 cursor-pointer">×</button>
        </div>
      )}

      {/* AUDIO PREVIEW */}
      {audioPreview && (
        <div className="mx-2 flex items-center gap-3 px-3 py-2 bg-[#17212b] border border-[#202b36] rounded-xl animate-[fadeUp_0.15s_ease]">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#2481cc] text-white text-[12px]">🎤</div>
          <div className="flex-1 min-w-0 flex items-center">
            <audio src={audioPreview.url} controls className="w-full h-8" />
          </div>
          <button onClick={removeAudio} className="text-[#708499] hover:text-[#ef476f] transition-colors text-xl p-1 cursor-pointer">×</button>
        </div>
      )}

      {/* INPUT ROW */}
      <div className="flex items-end gap-2.5 relative">

        {/* ATTACH BUTTON */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => !disabled && setShowMenu(!showMenu)}
            disabled={disabled || uploading || recording}
            title="Adjuntar contenido"
            className={`w-10.5 h-10.5 shrink-0 rounded-full flex items-center justify-center transition-all duration-150 shadow-md mb-0.5 cursor-pointer ${showMenu
                ? "bg-[#2b5278] text-white rotate-45"
                : "bg-[#17212b] hover:bg-[#202b36] border border-[#202b36] text-[#708499] hover:text-[#f5f5f5]"
              }`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {showMenu && (
            <div className="absolute bottom-13 left-0 bg-[#17212b] border border-[#202b36] rounded-2xl p-1.5 shadow-2xl flex flex-col gap-1 w-44 z-50 animate-[fadeUp_0.12s_ease]">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-3 px-3 py-2 text-[13.5px] text-[#f5f5f5] hover:bg-[#202b36] rounded-xl transition-colors text-left cursor-pointer"
              >
                <span className="text-base">🖼️</span> Fotos y Vídeos
              </button>
              <button
                onClick={() => pdfInputRef.current?.click()}
                className="flex items-center gap-3 px-3 py-2 text-[13.5px] text-[#f5f5f5] hover:bg-[#202b36] rounded-xl transition-colors text-left cursor-pointer"
              >
                <span className="text-base">📄</span> Documento (PDF)
              </button>
            </div>
          )}
        </div>

        <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={handleFileChange} className="hidden" />
        <input ref={pdfInputRef} type="file" accept="application/pdf" onChange={handleFileChange} className="hidden" />

        {/* EDITOR */}
        <div className="flex-1 bg-[#17212b] border border-[#202b36] rounded-xl flex flex-col focus-within:border-[#2b5278] transition-colors">
          <div className="flex items-center gap-1.5 px-3 pt-2 pb-1 border-b border-[rgba(255,255,255,0.03)]">
            {FORMAT_BUTTONS.map(btn => (
              <button
                key={btn.label}
                onClick={() => editor && btn.action(editor)}
                title={btn.title}
                disabled={disabled || !editor}
                className={`px-2 py-0.5 text-[12px] font-medium rounded transition-all disabled:opacity-30 cursor-pointer ${btn.style}
                  ${editor && btn.active(editor) ? "text-[#2481cc] bg-[rgba(36,129,204,0.12)]" : "text-[#708499] hover:text-[#f5f5f5]"}`}
              >
                {btn.label}
              </button>
            ))}
            {uploading && (
              <div className="ml-auto text-[12px] text-[#5288c1]">⏳ Subiendo...</div>
            )}
            {recording && (
              <div className="ml-auto text-[12px] text-[#ef476f] animate-pulse">● Grabando...</div>
            )}
          </div>
          <div className="px-2 py-0.5 max-h-35">
            <EditorContent editor={editor} />
          </div>
        </div>

        <div className="flex items-center gap-2 mb-0.5">

          {/* RECORD BUTTON */}
          <button
            onClick={toggleRecording}
            disabled={disabled || uploading || !!audioPreview}
            title={recording ? "Click para parar" : "Click para grabar audio"}
            className={`w-10.5 h-10.5 shrink-0 rounded-full flex items-center justify-center transition-all duration-150 active:scale-95 shadow-md cursor-pointer ${recording
                ? "bg-[#ef476f] text-white animate-pulse shadow-[0_0_12px_rgba(239,71,111,0.4)]"
                : "bg-[#ffffff] hover:bg-[#f0f0f0] text-[#2481cc] disabled:bg-[#202b36] disabled:text-[#52677a] disabled:cursor-not-allowed"
              }`}
          >
            {recording ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <rect x="4" y="4" width="16" height="16" rx="2" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20H9c-.55 0-1 .45-1 1s.45 1 1 1h6c.55 0 1-.45 1-1s-.45-1-1-1h-2v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z" />
              </svg>
            )}
          </button>

          {/* SEND BUTTON */}
          <button
            onClick={handleSend}
            disabled={disabled || (isEmpty && !filePreview && !audioPreview)}
            title="Enviar mensaje"
            className="pr-0.5 w-10.5 h-10.5 shrink-0 rounded-full bg-[#2481cc] hover:bg-[#2893e6] disabled:bg-[#202b36] disabled:text-[#52677a] text-white flex items-center justify-center transition-all active:scale-95 disabled:cursor-not-allowed cursor-pointer shadow-md"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="translate-x-px">
              <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

        </div>
      </div>

      <p className="px-2 text-[11px] text-[#52677a]">
        <span className="font-semibold text-[#708499]">Enter</span> para enviar ·{" "}
        <span className="font-semibold text-[#708499]">Shift+Enter</span> línea nueva ·{" "}
        <span className="font-semibold text-[#708499]">🎤</span> click para grabar · click para parar
      </p>
    </div>
  );
}