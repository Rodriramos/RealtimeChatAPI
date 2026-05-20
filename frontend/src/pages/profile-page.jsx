import { useState } from "react";
import { useAuth } from "../hooks/use-auth";

const API = "http://localhost:8080";

export default function ProfilePage({ onClose }) {
  // Traemos todo lo necesario del hook de autenticación en una sola línea
  const { token, user, logout, updateUser } = useAuth();
  const [currentTab, setCurrentTab] = useState("account");

  // Formulario Información
  const [username, setUsername] = useState(user?.username ?? "");
  const [email, setEmail] = useState(user?.email ?? "");

  // Formulario Seguridad
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI States
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const showFeedback = (ok, message) => {
    setFeedback({ ok, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/users/update`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: "Bearer " + token 
        },
        body: JSON.stringify({ username: username.trim(), email: email.trim() }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update profile");

      if (data.token) {
        updateUser({ username: username.trim(), email: email.trim() }, data.token);
      } else {
        updateUser({ username: username.trim(), email: email.trim() });
      }

      showFeedback(true, "Profile updated successfully!");
    } catch (err) {
      showFeedback(false, err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) return showFeedback(false, "Passwords do not match");

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/users/update-password`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: "Bearer " + token 
        },
        body: password, // Asegúrate de que tu backend reciba texto plano aquí, si no, usa JSON.stringify
      });
      if (!res.ok) throw new Error("Could not update password");

      showFeedback(true, "Password changed successfully!");
      setPassword(""); 
      setConfirmPassword("");
    } catch (err) {
      showFeedback(false, err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("⚠️ Are you absolutely sure you want to delete your account? This action is irreversible.")) return;

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/users/delete`, {
        method: "DELETE",
        headers: { Authorization: "Bearer " + token }
      });
      if (!res.ok) throw new Error("Could not delete account");

      logout();
    } catch (err) {
      showFeedback(false, err.message);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-1 bg-[#0e1621] font-sans text-[#f5f5f5] h-full overflow-hidden">

      
      <div className="w-56 bg-[#17212b] border-r border-[#101921] flex flex-col p-3 gap-1 shrink-0">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-[13px] text-[#5288c1] hover:bg-[#202b36] px-3 py-2 rounded-xl mb-4 text-left cursor-pointer transition-colors font-medium"
        >
          ← Back to Chat
        </button>

        <div className="flex flex-col items-center py-4 gap-2 border-b border-[#202b36] mb-4">
          <div className="w-16 h-16 rounded-full bg-[#2481cc] flex items-center justify-center text-[24px] font-bold shadow-md">
            {user?.username?.[0]?.toUpperCase() ?? "?"}
          </div>
          <span className="text-[15px] font-medium truncate w-full text-center">{user?.username}</span>
        </div>

        <button
          type="button"
          onClick={() => { setCurrentTab("account"); setFeedback(null); }}
          className={`px-4 py-2.5 rounded-xl text-[13px] text-left transition-all cursor-pointer ${currentTab === "account" ? "bg-[#2481cc] text-white font-medium" : "hover:bg-[#202b36] text-[#7b92ab]"}`}
        >
          👤 My Account
        </button>
        <button
          type="button"
          onClick={() => { setCurrentTab("security"); setFeedback(null); }}
          className={`px-4 py-2.5 rounded-xl text-[13px] text-left transition-all cursor-pointer ${currentTab === "security" ? "bg-[#2481cc] text-white font-medium" : "hover:bg-[#202b36] text-[#7b92ab]"}`}
        >
          🔒 Security & Privacy
        </button>
        <button
          type="button"
          onClick={() => { setCurrentTab("danger"); setFeedback(null); }}
          className={`px-4 py-2.5 rounded-xl text-[13px] text-left transition-all cursor-pointer ${currentTab === "danger" ? "bg-[#ef476f]/10 text-[#ef476f] font-medium" : "hover:bg-[#202b36] text-[#ef476f]/70"}`}
        >
          ⚙️ Danger Zone
        </button>
      </div>

      
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-[#101921] bg-[#17212b] shrink-0">
          <h2 className="text-[14px] text-[#5288c1] font-semibold tracking-wide">
            {currentTab === "account" && "Account Settings"}
            {currentTab === "security" && "Security Settings"}
            {currentTab === "danger" && "Danger Zone Actions"}
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-6 max-w-md w-full flex flex-col gap-5">
          {feedback && (
            <div className={`px-4 py-3 rounded-xl text-[13px] font-medium ${feedback.ok ? "bg-[rgba(36,129,204,0.1)] border border-[#2b5278] text-[#5288c1]" : "bg-[rgba(239,71,111,0.08)] border border-[#5a1a2a] text-[#ef476f]"}`}>
              {feedback.message}
            </div>
          )}

          
          {currentTab === "account" && (
            <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] tracking-widest uppercase text-[#708499] font-semibold">Username</label>
                <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="bg-[#17212b] border border-[#202b36] text-[#f5f5f5] text-[14px] px-4 py-2.5 rounded-xl outline-none focus:border-[#2b5278] transition-colors" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] tracking-widest uppercase text-[#708499] font-semibold">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="bg-[#17212b] border border-[#202b36] text-[#f5f5f5] text-[14px] px-4 py-2.5 rounded-xl outline-none focus:border-[#2b5278] transition-colors" />
              </div>
              <button type="submit" disabled={loading || (username === user?.username && email === user?.email)} className="self-start px-5 py-2.5 bg-[#2481cc] hover:bg-[#2893e6] disabled:bg-[#202b36] disabled:text-[#52677a] text-white text-[13px] font-medium rounded-xl transition-all shadow-md cursor-pointer disabled:cursor-not-allowed">
                {loading ? "Saving Changes..." : "Save Changes"}
              </button>
            </form>
          )}

          
          {currentTab === "security" && (
            <form onSubmit={handleUpdatePassword} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] tracking-widest uppercase text-[#708499] font-semibold">New Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="bg-[#17212b] border border-[#202b36] text-[#f5f5f5] text-[14px] px-4 py-2.5 rounded-xl outline-none focus:border-[#2b5278] transition-colors placeholder-[#394a5c]" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] tracking-widest uppercase text-[#708499] font-semibold">Confirm Password</label>
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" className="bg-[#17212b] border border-[#202b36] text-[#f5f5f5] text-[14px] px-4 py-2.5 rounded-xl outline-none focus:border-[#2b5278] transition-colors placeholder-[#394a5c]" />
              </div>
              <button type="submit" disabled={loading || !password} className="self-start px-5 py-2.5 bg-[#2481cc] hover:bg-[#2893e6] disabled:bg-[#202b36] disabled:text-[#52677a] text-white text-[13px] font-medium rounded-xl transition-all shadow-md cursor-pointer disabled:cursor-not-allowed">
                {loading ? "Updating..." : "Change Password"}
              </button>
            </form>
          )}

          
          {currentTab === "danger" && (
            <div className="bg-[#1a151d] border border-[#421d27] p-4 rounded-xl flex flex-col gap-3">
              <h4 className="text-[13px] font-semibold text-[#ef476f]">Delete Entire Account</h4>
              <p className="text-[12px] text-[#a18c92] leading-relaxed">
                Once you delete your account, there is no going back. All your private channels, sent messages, and system relationships will be instantly wiped out from the server.
              </p>
              <button type="button" onClick={handleDeleteAccount} disabled={loading} className="self-start px-4 py-2 bg-[#ef476f] hover:bg-[#f25c7f] text-white text-[12px] font-semibold rounded-xl transition-all shadow-md cursor-pointer">
                {loading ? "Deleting..." : "Delete Account"}
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}