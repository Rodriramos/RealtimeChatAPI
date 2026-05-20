import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../hooks/use-auth";

const API = "http://localhost:8080";

export default function CreateRoomForm({ onSubmit }) {
  const { token } = useAuth();

  const [name,          setName]          = useState("");
  const [query,         setQuery]         = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]); // [{ id, username, email }]
  const [loading,       setLoading]       = useState(false);
  const [result,        setResult]        = useState(null);
  const [searching,     setSearching]     = useState(false);
  const searchTimer                       = useRef(null);

  // ── BUSCAR USUARIOS ────────────────────────────────────────────────
  useEffect(() => {
    if (query.length < 2) { setSearchResults([]); return; }

    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`${API}/api/users/search?query=${encodeURIComponent(query)}`, {
          headers: { Authorization: "Bearer " + token },
        });
        const data = await res.json();
        // Filtrar los ya seleccionados
        setSearchResults(data.filter(u => !selectedUsers.some(s => s.id === u.id)));
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300); // debounce 300ms

    return () => clearTimeout(searchTimer.current);
  }, [query]);

  const addUser = (user) => {
    setSelectedUsers(prev => [...prev, user]);
    setSearchResults([]);
    setQuery("");
  };

  const removeUser = (userId) => {
    setSelectedUsers(prev => prev.filter(u => u.id !== userId));
  };

  // ── CREAR SALA ─────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!name.trim())            { setResult({ ok: false, message: "Room name is required" }); return; }
    if (!selectedUsers.length)   { setResult({ ok: false, message: "Add at least one user" }); return; }

    setLoading(true);
    try {
      const emails = selectedUsers.map(u => u.email);
      const room   = await onSubmit(name.trim(), emails);
      setResult({ ok: true, message: `Room "${room.name}" created!` });
      setName(""); setSelectedUsers([]);
    } catch {
      setResult({ ok: false, message: "Failed to create room" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#0e1621] font-sans">

      {/* HEADER */}
      <div className="px-6 py-4 border-b border-[#101921] bg-[#17212b]">
        <p className="text-[13px] text-[#5288c1] font-medium tracking-wide">New Private Room</p>
      </div>

      <div className="px-6 py-5 flex flex-col gap-5 max-w-lg">

        {/* ROOM NAME */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] tracking-widest uppercase text-[#708499] font-semibold">
            Room name
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Project Alpha"
            className="bg-[#17212b] border border-[#202b36] text-[#f5f5f5] text-[14px] px-4 py-2.5 rounded-xl outline-none placeholder-[#52677a] focus:border-[#2b5278] transition-colors"
          />
        </div>

        {/* SELECTED USERS */}
        {selectedUsers.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedUsers.map(u => (
              <div key={u.id}
                className="flex items-center gap-2 bg-[#2b5278] text-white text-[13px] px-3 py-1.5 rounded-full">
                <div className="w-5 h-5 rounded-full bg-[#1a3a5c] flex items-center justify-center text-[10px] font-bold">
                  {u.username[0].toUpperCase()}
                </div>
                <span>{u.username}</span>
                <button
                  onClick={() => removeUser(u.id)}
                  className="text-[#7ca2c7] hover:text-white transition-colors ml-0.5 cursor-pointer"
                >×</button>
              </div>
            ))}
          </div>
        )}

        {/* SEARCH */}
        <div className="flex flex-col gap-1.5 relative">
          <label className="text-[11px] tracking-widest uppercase text-[#708499] font-semibold">
            Add people
          </label>
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full bg-[#17212b] border border-[#202b36] text-[#f5f5f5] text-[14px] px-4 py-2.5 rounded-xl outline-none placeholder-[#52677a] focus:border-[#2b5278] transition-colors pr-10"
            />
            {searching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5288c1] text-[12px] animate-pulse">
                ⏳
              </div>
            )}
          </div>

          {/* RESULTADOS */}
          {searchResults.length > 0 && (
            <div className="bg-[#17212b] border border-[#202b36] rounded-xl overflow-hidden shadow-xl">
              {searchResults.map(u => (
                <div
                  key={u.id}
                  onClick={() => addUser(u)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-[#202b36] cursor-pointer transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-[#2b5278] flex items-center justify-center text-white text-[14px] font-semibold shrink-0">
                    {u.username[0].toUpperCase()}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[14px] text-[#f5f5f5] font-medium">{u.username}</span>
                    <span className="text-[12px] text-[#708499] truncate">{u.email}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {query.length >= 2 && !searching && searchResults.length === 0 && (
            <p className="text-[12px] text-[#52677a] px-1">No users found</p>
          )}
        </div>

        {/* SUBMIT */}
        <button
          onClick={handleSubmit}
          disabled={loading || !name.trim() || !selectedUsers.length}
          className="self-start px-6 py-2.5 bg-[#2481cc] hover:bg-[#2893e6] disabled:bg-[#202b36] disabled:text-[#52677a] text-white text-[14px] font-medium rounded-xl transition-all active:scale-95 disabled:cursor-not-allowed cursor-pointer shadow-md"
        >
          {loading ? "Creating..." : "Create room →"}
        </button>

        {result && (
          <div className={`px-4 py-3 rounded-xl text-[13px] font-medium ${
            result.ok
              ? "bg-[rgba(36,129,204,0.1)] border border-[#2b5278] text-[#5288c1]"
              : "bg-[rgba(239,71,111,0.08)] border border-[#5a1a2a] text-[#ef476f]"
          }`}>
            {result.message}
          </div>
        )}

      </div>
    </div>
  );
}