import { useState } from "react";

export default function CreateRoomForm({ onSubmit, onCancel }) {
  const [name, setName] = useState("");
  const [emails, setEmails] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) { 
      setResult({ ok: false, message: "The room name is required." }); 
      return; 
    }
    const emailList = emails.split("\n").map(e => e.trim()).filter(Boolean);
    setLoading(true);
    try {
      const room = await onSubmit(name.trim(), emailList);
      setResult({ ok: true, message: `Room "${room.name}" created successfully!` });
      setName(""); 
      setEmails("");
    } catch {
      setResult({ ok: false, message: "Failed to create room." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#0e1621] p-8 font-sans flex justify-center">
      <div className="w-full max-w-md flex flex-col gap-6">
        
        {/* TITLE */}
        <div>
          <h2 className="text-[16px] font-medium text-[#f5f5f5] mb-1">Create Private Room</h2>
          <p className="text-[13px] text-[#708499]">Groups can have up to multiple members invited via email.</p>
        </div>

        {/* ROOM NAME */}
        <div className="flex flex-col gap-2">
          <label className="text-[13px] font-medium text-[#5288c1]">
            Room Name
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g., Project Alpha"
            className="w-full bg-[#17212b] border border-[#202b36] text-[#f5f5f5] text-[14px] px-3 py-2.5 rounded-xl outline-none placeholder-[#52677a] focus:border-[#2481cc] transition-colors"
          />
        </div>

        {/* EMAILS */}
        <div className="flex flex-col gap-2">
          <label className="text-[13px] font-medium text-[#5288c1] flex items-center justify-between">
            <span>Guest Emails</span>
            <span className="text-[12px] text-[#708499] font-normal">One per line</span>
          </label>
          <textarea
            value={emails}
            onChange={e => setEmails(e.target.value)}
            placeholder={"ana@email.com\ncarlos@email.com"}
            rows={4}
            className="w-full bg-[#17212b] border border-[#202b36] text-[#f5f5f5] text-[14px] px-3 py-2.5 rounded-xl outline-none placeholder-[#52677a] focus:border-[#2481cc] transition-colors resize-none leading-relaxed"
          />
        </div>

        {/* ACTIONS */}
        <button
          onClick={handleSubmit}
          disabled={loading || !name.trim()}
          className="w-full py-3 bg-[#2481cc] text-white font-medium text-[14px] rounded-xl transition-all hover:bg-[#2893e6] disabled:bg-[#1d2a39] disabled:text-[#52677a] disabled:cursor-not-allowed cursor-pointer shadow-sm text-center mt-2"
        >
          {loading ? "Creating room..." : "Create Room"}
        </button>

        {/* ERROR MESSAGE */}
        {result && (
          <div className={`px-4 py-3 rounded-xl border text-[13.5px] font-medium transition-all animate-[fadeUp_0.15s_ease] ${
            result.ok
              ? "bg-[rgba(76,195,122,0.1)] border-[#4cc37a] text-[#4cc37a]" // Verde sutil Telegram
              : "bg-[rgba(239,71,111,0.1)] border-[#ef476f] text-[#ef476f]"  // Rojo sutil Telegram
          }`}>
            <div className="flex items-center gap-2">
              <span>{result.ok ? "✓" : "✕"}</span>
              <p>{result.message}</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}