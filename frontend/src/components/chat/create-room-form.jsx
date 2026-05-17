import { useState } from "react";

export default function CreateRoomForm({ onSubmit, onCancel }) {
  const [name, setName] = useState("");
  const [emails, setEmails] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
  if (!name.trim()) { setResult({ ok: false, message: "The room name is required." }); return; }
  const emailList = emails.split("\n").map(e => e.trim()).filter(Boolean);
  setLoading(true);
  try {
    const room = await onSubmit(name.trim(), emailList);
    setResult({ ok: true, message: `Room "${room.name}" created successfully!` });
    setName(""); setEmails("");
  } catch {
    setResult({ ok: false, message: "Failed to create room." });
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="flex-1 overflow-y-auto bg-[#080c0e] p-6">
      <div className="max-w-md flex flex-col gap-5">

        <div>
          <p className="text-[9px] tracking-[0.2em] uppercase text-[#6a8a98] font-mono font-medium mb-1.5">
            Room Name
          </p>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g.: Project Alpha"
            className="w-full bg-[#111618] border border-[#243038] text-[#c8d8e0] font-mono text-[12px] px-3 py-2 rounded-sm outline-none placeholder-[#334450] focus:border-[#007a60] transition-colors"
          />
        </div>

        <div>
          <p className="text-[9px] tracking-[0.2em] uppercase text-[#6a8a98] font-mono font-medium mb-1.5">
            Guest Emails <span className="text-[#334450] normal-case tracking-normal">(one per line)</span>
          </p>
          <textarea
            value={emails}
            onChange={e => setEmails(e.target.value)}
            placeholder={"ana@email.com\ncarlos@email.com"}
            rows={4}
            className="w-full bg-[#111618] border border-[#243038] text-[#c8d8e0] font-mono text-[12px] px-3 py-2 rounded-sm outline-none placeholder-[#334450] focus:border-[#007a60] transition-colors resize-none"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading || !name.trim()}
          className="self-start px-5 py-2 bg-[#012820] border border-[#007a60] text-[#00d4aa] font-mono text-[11px] tracking-wide rounded-sm transition-all hover:bg-[#013d30] hover:border-[#00d4aa] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? "Creating..." : "Create private room →"}
        </button>

        {result && (
          <div className={`px-3 py-2.5 rounded-sm border font-mono text-[12px] ${
            result.ok
              ? "bg-[#012820] border-[#007a60] text-[#00d4aa]"
              : "bg-[#200810] border-[#5a2030] text-[#e05060]"
          }`}>
            {result.message}
          </div>
        )}

      </div>
    </div>
  )
}