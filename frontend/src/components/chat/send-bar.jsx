import { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

const FORMAT_BUTTONS = [
  {
    label:  "B",
    title:  "Negrita",
    action: (e) => e.chain().focus().toggleBold().run(),
    active: (e) => e.isActive("bold"),
    style:  "font-bold",
  },
  {
    label:  "I",
    title:  "Cursiva",
    action: (e) => e.chain().focus().toggleItalic().run(),
    active: (e) => e.isActive("italic"),
    style:  "italic",
  },
  {
    label:  "</>",
    title:  "Código",
    action: (e) => e.chain().focus().toggleCode().run(),
    active: (e) => e.isActive("code"),
    style:  "font-mono text-[10px]",
  },
];

export default function SendBar({ onSend, disabled, onTyping }) {

  const [isEmpty, setIsEmpty] = useState(true);

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

  const handleSend = () => {
  if (!editor || editor.isEmpty) return;
  onSend(editor.getHTML());
  editor.commands.clearContent();
  setIsEmpty(true);
};

  return (
    <div className="border-t border-[#1c2428] bg-[#0d1214] shrink-0">

      {/* BARRA DE FORMATO */}
      <div className="flex items-center gap-1 px-3 pt-2">
        {FORMAT_BUTTONS.map(btn => (
          <button
            key={btn.label}
            onClick={() => editor && btn.action(editor)}
            title={btn.title}
            disabled={disabled || !editor}
            className={`px-2 py-0.5 text-[11px] border rounded transition-all disabled:opacity-30 cursor-pointer ${btn.style}
              ${editor && btn.active(editor)
                ? "text-[#00d4aa] border-[#007a60] bg-[#012820]"
                : "text-[#6a8a98] border-transparent hover:border-[#243038] hover:text-[#c8d8e0] hover:bg-[#111618]"
              }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* EDITOR */}
      <div className="flex gap-2 px-3 py-2">
        <div className={`flex-1 bg-[#111618] border border-[#243038] rounded-sm transition-colors focus-within:border-[#007a60] ${disabled ? "opacity-40 pointer-events-none" : ""}`}>
          <EditorContent editor={editor} />
        </div>
        <button
          onClick={handleSend}
          disabled={disabled || !editor?.getText().trim()}
          className="px-4 py-2 bg-[#012820] border border-[#007a60] text-[#00d4aa] font-mono text-[11px] tracking-wide rounded-sm transition-all hover:bg-[#013d30] hover:border-[#00d4aa] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer self-end"
        >
          Enviar
        </button>
      </div>

      <p className="px-3 pb-1.5 text-[10px] text-[#2a3d48] font-mono">
        Enter para enviar · Shift+Enter nueva línea
      </p>

    </div>
  );
}