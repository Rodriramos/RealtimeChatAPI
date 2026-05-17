import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useRef, useState } from "react";
import { useAuth } from "../../hooks/use-auth";

const API = "http://localhost:8080";

const FORMAT_BUTTONS = [
  { label: "B",   title: "Negrita", action: (e) => e.chain().focus().toggleBold().run(),   active: (e) => e.isActive("bold"),   style: "font-bold" },
  { label: "I",   title: "Cursiva", action: (e) => e.chain().focus().toggleItalic().run(), active: (e) => e.isActive("italic"), style: "italic" },
  { label: "</>", title: "Código",  action: (e) => e.chain().focus().toggleCode().run(),   active: (e) => e.isActive("code"),   style: "font-mono text-[10px]" },
];

export default function SendBar({ onSend, disabled, onTyping }) {
  const { token } = useAuth();
  const [isEmpty,    setIsEmpty]    = useState(true);
  const [uploading,  setUploading]  = useState(false);
  const [filePreview, setFilePreview] = useState(null); // { url, name, type }
  const fileInputRef = useRef(null);

  const editor = useEditor({
    extensions: [StarterKit],
    editorProps: {
      attributes: {
        class: "outline-none min-h-[38px] max-h-[120px] overflow-y-auto text-[13px] font-sans font-light text-[#c8d8e0] px-3 py-2",
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
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API}/api/upload`, {
        method: "POST",
        headers: { Authorization: "Bearer " + token },
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();

      setFilePreview({
        url:          data.url,
        name:         file.name,
        resourceType: data.resourceType,
      });
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
      e.target.value = ""; // reset input
    }
  };

  const removeFile = () => setFilePreview(null);

  // ── SEND ──────────────────────────────────────────────────────────────
  const handleSend = () => {
    if (!editor) return;
    if (editor.isEmpty && !filePreview) return;

    if (filePreview) {
      // Mensaje con archivo
      onSend({
        content:      editor.isEmpty ? "" : editor.getHTML(),
        messageType:  filePreview.resourceType === "video" ? "VIDEO" : "IMAGE",
        fileUrl:      filePreview.url,
        fileName:     filePreview.name,
      });
      setFilePreview(null);
    } else {
      // Mensaje de texto
      onSend({
        content:     editor.getHTML(),
        messageType: "TEXT",
        fileUrl:     null,
        fileName:    null,
      });
    }

    editor.commands.clearContent();
    setIsEmpty(true);
  };

  return (
    <div className="border-t border-[#1c2428] bg-[#0d1214] shrink-0">

      {/* PREVIEW DEL ARCHIVO */}
      {filePreview && (
        <div className="mx-3 mt-2 flex items-center gap-3 px-3 py-2 bg-[#111618] border border-[#243038] rounded-sm">
          {filePreview.resourceType === "image" ? (
            <img src={filePreview.url} alt={filePreview.name}
              className="w-16 h-16 object-cover rounded" />
          ) : (
            <video src={filePreview.url} className="w-16 h-16 object-cover rounded" />
          )}
          <div className="flex flex-col gap-0.5 flex-1 min-w-0">
            <span className="text-[12px] text-[#c8d8e0] font-sans truncate">{filePreview.name}</span>
            <span className="text-[10px] text-[#334450] font-mono">{filePreview.resourceType}</span>
          </div>
          <button onClick={removeFile}
            className="text-[#334450] hover:text-[#e05060] transition-colors text-lg cursor-pointer">
            ×
          </button>
        </div>
      )}

      {/* BARRA DE FORMATO */}
      <div className="flex items-center gap-1 px-3 pt-2">
        {FORMAT_BUTTONS.map(btn => (
          <button key={btn.label} onClick={() => editor && btn.action(editor)}
            title={btn.title} disabled={disabled || !editor}
            className={`px-2 py-0.5 text-[11px] border rounded transition-all disabled:opacity-30 cursor-pointer ${btn.style}
              ${editor && btn.active(editor)
                ? "text-[#00d4aa] border-[#007a60] bg-[#012820]"
                : "text-[#6a8a98] border-transparent hover:border-[#243038] hover:text-[#c8d8e0] hover:bg-[#111618]"
              }`}>
            {btn.label}
          </button>
        ))}

        {/* Separador */}
        <div className="w-px h-3 bg-[#1c2428] mx-1" />

        {/* Botón adjuntar */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || uploading}
          title="Adjuntar imagen o vídeo"
          className="px-2 py-0.5 text-[11px] text-[#6a8a98] border border-transparent rounded hover:border-[#243038] hover:text-[#c8d8e0] hover:bg-[#111618] transition-all disabled:opacity-30 cursor-pointer"
        >
          {uploading ? "⏳" : "📎"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* EDITOR */}
      <div className="flex gap-2 px-3 py-2">
        <div className={`flex-1 bg-[#111618] border border-[#243038] rounded-sm transition-colors focus-within:border-[#007a60] ${disabled ? "opacity-40 pointer-events-none" : ""}`}>
          <EditorContent editor={editor} />
        </div>
        <button
          onClick={handleSend}
          disabled={disabled || (isEmpty && !filePreview)}
          className="px-4 py-2 bg-[#012820] border border-[#007a60] text-[#00d4aa] font-mono text-[11px] tracking-wide rounded-sm transition-all hover:bg-[#013d30] hover:border-[#00d4aa] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer self-end"
        >
          Enviar
        </button>
      </div>

      <p className="px-3 pb-1.5 text-[10px] text-[#2a3d48] font-mono">
        Enter para enviar · Shift+Enter nueva línea · 📎 imagen o vídeo
      </p>
    </div>
  );
}