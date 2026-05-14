import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/use-auth.js";

const API = "http://localhost:8080";

export default function LoginPage() {
  const [mode, setMode]         = useState("login"); // "login" | "register"
  const [username, setUsername] = useState("");
  const [email, setEmail]       = useState("");
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

  // ── LOGIN ──────────────────────────────────────────────────────────────
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

  // ── REGISTER ───────────────────────────────────────────────────────────
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
      // Auto-login after register
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

  // ── GOOGLE ─────────────────────────────────────────────────────────────
  const handleGoogle = () => {
    window.location.href = `${API}/oauth2/authorization/google`;
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Syne+Mono&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg:       #06080a;
          --surface:  #0c1015;
          --border:   #1a2228;
          --border2:  #253040;
          --text:     #dce8f0;
          --text2:    #5a7888;
          --text3:    #2a3d48;
          --accent:   #00e5b0;
          --accent2:  #008060;
          --err:      #ff4d6a;
          --google:   #e8f0fe;
        }

        .lp-root {
          min-height: 100vh;
          background: var(--bg);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Syne', sans-serif;
          position: relative;
          overflow: hidden;
        }

        /* background grid */
        .lp-root::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(var(--border) 1px, transparent 1px),
            linear-gradient(90deg, var(--border) 1px, transparent 1px);
          background-size: 48px 48px;
          opacity: 0.4;
          pointer-events: none;
        }

        /* glow blob */
        .lp-root::after {
          content: '';
          position: absolute;
          width: 600px; height: 600px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(0,229,176,0.06) 0%, transparent 70%);
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
        }

        .lp-card {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 420px;
          padding: 48px 40px;
          background: var(--surface);
          border: 1px solid var(--border2);
          border-radius: 4px;
          animation: cardIn 0.4s cubic-bezier(0.16,1,0.3,1);
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .lp-logo {
          font-size: 11px;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: 32px;
          font-family: 'Syne Mono', monospace;
        }
        .lp-logo span { color: var(--text2); }

        .lp-tabs {
          display: flex;
          gap: 0;
          margin-bottom: 32px;
          border-bottom: 1px solid var(--border);
        }
        .lp-tab {
          flex: 1;
          padding: 10px;
          text-align: center;
          font-size: 12px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text2);
          cursor: pointer;
          border: none;
          background: none;
          font-family: 'Syne', sans-serif;
          font-weight: 600;
          border-bottom: 2px solid transparent;
          margin-bottom: -1px;
          transition: color 0.15s, border-color 0.15s;
        }
        .lp-tab:hover  { color: var(--text); }
        .lp-tab.active { color: var(--accent); border-bottom-color: var(--accent); }

        .lp-field { margin-bottom: 16px; }
        .lp-label {
          display: block;
          font-size: 10px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--text2);
          margin-bottom: 6px;
          font-weight: 600;
        }
        .lp-input {
          width: 100%;
          background: var(--bg);
          border: 1px solid var(--border2);
          color: var(--text);
          font-family: 'Syne Mono', monospace;
          font-size: 13px;
          padding: 10px 14px;
          border-radius: 3px;
          outline: none;
          transition: border-color 0.2s;
        }
        .lp-input:focus { border-color: var(--accent2); }
        .lp-input::placeholder { color: var(--text3); }

        .lp-btn {
          width: 100%;
          padding: 12px;
          font-family: 'Syne', sans-serif;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          border-radius: 3px;
          cursor: pointer;
          transition: all 0.15s;
          border: none;
          margin-top: 8px;
        }
        .lp-btn-primary {
          background: var(--accent);
          color: #000;
        }
        .lp-btn-primary:hover:not(:disabled) { background: #00ffcc; }
        .lp-btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }

        .lp-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 20px 0;
          font-size: 10px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text3);
        }
        .lp-divider::before, .lp-divider::after {
          content: ''; flex: 1; height: 1px; background: var(--border);
        }

        .lp-btn-google {
          background: var(--bg);
          border: 1px solid var(--border2);
          color: var(--text);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        .lp-btn-google:hover { background: var(--surface); border-color: #3a5060; }

        .lp-google-icon {
          width: 16px; height: 16px;
          flex-shrink: 0;
        }

        .lp-error {
          margin-top: 14px;
          padding: 10px 12px;
          background: rgba(255,77,106,0.08);
          border: 1px solid rgba(255,77,106,0.25);
          border-radius: 3px;
          font-size: 12px;
          color: var(--err);
          font-family: 'Syne Mono', monospace;
        }
      `}</style>

      <div className="lp-root">
        <div className="lp-card">
          <div className="lp-logo">realtime<span>/</span>chat</div>

          <div className="lp-tabs">
            <button className={`lp-tab ${mode === "login"    ? "active" : ""}`} onClick={() => switchMode("login")}>Sign in</button>
            <button className={`lp-tab ${mode === "register" ? "active" : ""}`} onClick={() => switchMode("register")}>Register</button>
          </div>

          {mode === "login" ? (
            <form onSubmit={handleLogin}>
              <div className="lp-field">
                <label className="lp-label">Username</label>
                <input className="lp-input" type="text" placeholder="your_username"
                  value={username} onChange={e => setUsername(e.target.value)} required />
              </div>
              <div className="lp-field">
                <label className="lp-label">Password</label>
                <input className="lp-input" type="password" placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              <button className="lp-btn lp-btn-primary" type="submit" disabled={loading}>
                {loading ? "Signing in..." : "Sign in →"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister}>
              <div className="lp-field">
                <label className="lp-label">Username</label>
                <input className="lp-input" type="text" placeholder="your_username"
                  value={username} onChange={e => setUsername(e.target.value)} required />
              </div>
              <div className="lp-field">
                <label className="lp-label">Email</label>
                <input className="lp-input" type="email" placeholder="you@email.com"
                  value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className="lp-field">
                <label className="lp-label">Password</label>
                <input className="lp-input" type="password" placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              <div className="lp-field">
                <label className="lp-label">Confirm password</label>
                <input className="lp-input" type="password" placeholder="••••••••"
                  value={confirm} onChange={e => setConfirm(e.target.value)} required />
              </div>
              <button className="lp-btn lp-btn-primary" type="submit" disabled={loading}>
                {loading ? "Creating account..." : "Create account →"}
              </button>
            </form>
          )}

          <div className="lp-divider">or</div>

          <button className="lp-btn lp-btn-google" onClick={handleGoogle}>
            <svg className="lp-google-icon" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          {error && <div className="lp-error">⚠ {error}</div>}
        </div>
      </div>
    </>
  );
}