import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/use-auth.js";

const API = "http://localhost:8080";

export default function LoginPage() {
  const [mode,     setMode]     = useState("login");
  const [username, setUsername] = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [error,    setError]    = useState(null);
  const [loading,  setLoading]  = useState(false);

  const { login } = useAuth();
  const navigate  = useNavigate();

  const reset = () => {
    setError(null);
    setUsername(""); setEmail(""); setPassword(""); setConfirm("");
  };

  const switchMode = (m) => { reset(); setMode(m); };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) throw new Error("Incorrect username or password");
      const { token } = await res.json();
      const userRes = await fetch(`${API}/api/users/me`, {
        headers: { Authorization: "Bearer " + token },
      });
      const user = await userRes.json();
      login(token, user);
      navigate("/chat");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords do not match"); return; }
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.message || "Registration failed");
      }
      const { token } = await res.json();
      const userRes = await fetch(`${API}/api/users/me`, {
        headers: { Authorization: "Bearer " + token },
      });
      const user = await userRes.json();
      login(token, user);
      navigate("/chat");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    window.location.href = `${API}/oauth2/authorization/google`;
  };

  return (
    <div className="min-h-screen bg-[#06080a] flex items-center justify-center font-sans relative overflow-hidden">

      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(#1a2228 1px, transparent 1px), linear-gradient(90deg, #1a2228 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Glow blob */}
      <div className="absolute w-150 h-150 rounded-full pointer-events-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ background: "radial-gradient(circle, rgba(0,229,176,0.06) 0%, transparent 70%)" }}
      />

      {/* Card */}
      <div className="relative z-10 w-full max-w-105 mx-4 px-10 py-12 bg-[#0c1015] border border-[#253040] rounded animate-[cardIn_0.4s_cubic-bezier(0.16,1,0.3,1)]">

        {/* Logo */}
        <p className="font-mono text-[11px] tracking-[0.25em] uppercase text-[#00e5b0] mb-8">
          realtime<span className="text-[#5a7888]">/</span>chat
        </p>

        {/* Tabs */}
        <div className="flex border-b border-[#1a2228] mb-8">
          {["login", "register"].map(m => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={`flex-1 py-2.5 text-[12px] tracking-widest uppercase font-semibold border-b-2 -mb-px transition-all cursor-pointer bg-none border-t-0 border-l-0 border-r-0
                ${mode === m
                  ? "text-[#00e5b0] border-[#00e5b0]"
                  : "text-[#5a7888] border-transparent hover:text-[#dce8f0]"
                }`}
            >
              {m === "login" ? "Sign in" : "Register"}
            </button>
          ))}
        </div>

        {/* LOGIN FORM */}
        {mode === "login" && (
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <Field label="Username">
              <Input type="text" placeholder="your_username"
                value={username} onChange={e => setUsername(e.target.value)} required />
            </Field>
            <Field label="Password">
              <Input type="password" placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)} required />
            </Field>
            <PrimaryBtn loading={loading}>
              {loading ? "Signing in..." : "Sign in →"}
            </PrimaryBtn>
          </form>
        )}

        {/* REGISTER FORM */}
        {mode === "register" && (
          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <Field label="Username">
              <Input type="text" placeholder="your_username"
                value={username} onChange={e => setUsername(e.target.value)} required />
            </Field>
            <Field label="Email">
              <Input type="email" placeholder="you@email.com"
                value={email} onChange={e => setEmail(e.target.value)} required />
            </Field>
            <Field label="Password">
              <Input type="password" placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)} required />
            </Field>
            <Field label="Confirm password">
              <Input type="password" placeholder="••••••••"
                value={confirm} onChange={e => setConfirm(e.target.value)} required />
            </Field>
            <PrimaryBtn loading={loading}>
              {loading ? "Creating account..." : "Create account →"}
            </PrimaryBtn>
          </form>
        )}

        {/* DIVIDER */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-[#1a2228]" />
          <span className="text-[10px] tracking-widest uppercase text-[#2a3d48]">or</span>
          <div className="flex-1 h-px bg-[#1a2228]" />
        </div>

        {/* GOOGLE */}
        <button
          onClick={handleGoogle}
          className="w-full flex items-center justify-center gap-2.5 py-3 bg-[#06080a] border border-[#253040] text-[#dce8f0] text-[12px] tracking-widest uppercase font-semibold rounded-sm hover:bg-[#0c1015] hover:border-[#3a5060] transition-all cursor-pointer"
        >
          <GoogleIcon />
          Continue with Google
        </button>

        {/* ERROR */}
        {error && (
          <div className="mt-4 px-3 py-2.5 bg-[rgba(255,77,106,0.08)] border border-[rgba(255,77,106,0.25)] rounded-sm text-[12px] text-[#ff4d6a] font-mono">
            ⚠ {error}
          </div>
        )}

      </div>

      <style>{`
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

    </div>
  );
}

// ── SUBCOMPONENTES ──────────────────────────────────────────────────────────

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] tracking-[0.15em] uppercase text-[#5a7888] font-semibold">
        {label}
      </label>
      {children}
    </div>
  );
}

function Input({ ...props }) {
  return (
    <input
      {...props}
      className="w-full bg-[#06080a] border border-[#253040] text-[#dce8f0] font-mono text-[13px] px-3.5 py-2.5 rounded-sm outline-none placeholder-[#2a3d48] transition-colors focus:border-[#008060]"
    />
  );
}

function PrimaryBtn({ loading, children }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full mt-1 py-3 bg-[#00e5b0] text-black text-[12px] tracking-[0.15em] uppercase font-bold rounded-sm transition-all hover:bg-[#00ffcc] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
    >
      {children}
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" className="shrink-0">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}