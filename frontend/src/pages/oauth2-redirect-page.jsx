import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/use-auth.js";

export default function OAuth2RedirectPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token  = params.get("token");

    if (!token) { navigate("/login"); return; }

    fetch("http://localhost:8080/api/users/me", {
      headers: { Authorization: "Bearer " + token }
    })
    .then(r => r.json())
    .then(user => {
      login(token, user);
      navigate("/chat");
    })
    .catch(() => navigate("/login"));
  }, []);

  return (
    <div style={{ 
      minHeight: "100vh", background: "#06080a", 
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#00e5b0", fontFamily: "monospace", fontSize: "13px"
    }}>
      Authenticating...
    </div>
  );
}