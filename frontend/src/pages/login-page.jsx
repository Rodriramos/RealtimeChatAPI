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
        body: JSON.stringify({ username, email, password, confirmPassword: confirm }),
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
    <div className="min-h-screen bg-[#0e1621] flex items-center justify-center font-sans relative overflow-hidden">
      <div className="absolute w-150 h-150 rounded-full pointer-events-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ background: "radial-gradient(circle, rgba(36,129,204,0.05) 0%, transparent 70%)" }}
      />

      {/* Form card */}
      <div className="relative z-10 w-full max-w-105 mx-4 px-10 py-12 bg-[#182533] border border-[#202b36] rounded-xl shadow-xl animate-[cardIn_0.4s_cubic-bezier(0.16,1,0.3,1)]">
        
        <p className="font-sans text-[13px] tracking-wide text-[#2481cc] mb-8 text-center uppercase font-extrabold">
          Realtime Chat
        </p>

        <div className="flex border-b border-[#101921] mb-8">
          {["login", "register"].map(m => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={`flex-1 py-3 text-[14px] font-medium border-b-2 -mb-px transition-all cursor-pointer bg-none border-t-0 border-l-0 border-r-0
                ${mode === m
                  ? "text-[#2481cc] border-[#2481cc]"
                  : "text-[#708499] border-transparent hover:text-[#f5f5f5]"
                }`}
            >
              {m === "login" ? "Sign In" : "Register"}
            </button>
          ))}
        </div>

        {/* LOGIN FORM */}
        {mode === "login" && (
          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <Field label="Username">
              <Input type="text" placeholder="Enter your username"
                value={username} onChange={e => setUsername(e.target.value)} required />
            </Field>
            <Field label="Password">
              <Input type="password" placeholder="Enter password"
                value={password} onChange={e => setPassword(e.target.value)} required />
            </Field>
            <PrimaryBtn loading={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </PrimaryBtn>
          </form>
        )}

        {/* REGISTER FORM */}
        {mode === "register" && (
          <form onSubmit={handleRegister} className="flex flex-col gap-5">
            <Field label="Username">
              <Input type="text" placeholder="Choose a username"
                value={username} onChange={e => setUsername(e.target.value)} required />
            </Field>
            <Field label="Email">
              <Input type="email" placeholder="name@example.com"
                value={email} onChange={e => setEmail(e.target.value)} required />
            </Field>
            <Field label="Password">
              <Input type="password" placeholder="Create password"
                value={password} onChange={e => setPassword(e.target.value)} required />
            </Field>
            <Field label="Confirm password">
              <Input type="password" placeholder="Repeat password"
                value={confirm} onChange={e => setConfirm(e.target.value)} required />
            </Field>
            <PrimaryBtn loading={loading}>
              {loading ? "Registering..." : "Register"}
            </PrimaryBtn>
          </form>
        )}

        {/* DIVIDER */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-[#101921]" />
          <span className="text-[11px] text-[#52677a] uppercase font-medium tracking-wider">or</span>
          <div className="flex-1 h-px bg-[#101921]" />
        </div>

        {/* GOOGLE BUTTON - Adaptado a la sobriedad de Telegram */}
        <button
          onClick={handleGoogle}
          className="w-full flex items-center justify-center gap-2.5 py-3 bg-[#101921] border border-[#202b36] text-[#f5f5f5] text-[13px] font-medium rounded-lg hover:bg-[#141f29] transition-all cursor-pointer"
        >
          <GoogleIcon />
          Continue with Google
        </button>

        {/* ERROR - Tono rojo pastel/salmón más integrado */}
        {error && (
          <div className="mt-5 px-4 py-3 bg-[rgba(239,71,111,0.08)] border border-[rgba(239,71,111,0.2)] rounded-lg text-[13px] text-[#ef476f] text-center">
            {error}
          </div>
        )}

      </div>

      <style>{`
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(12px); }
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
      {/* CAMBIO: Fuente sans normal y color de etiqueta gris azulado suave */}
      <label className="text-[12px] font-medium text-[#708499] ml-1">
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
      className="w-full bg-[#101921] border border-[#202b36] text-[#f5f5f5] text-[14px] px-4 py-3 rounded-lg outline-none placeholder-[#52677a] transition-all focus:border-[#2481cc] focus:bg-[#0e1621]"
    />
  );
}

function PrimaryBtn({ loading, children }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full mt-2 py-3 bg-[#2481cc] text-white text-[14px] font-semibold rounded-lg transition-all hover:bg-[#2893e6] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-md"
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