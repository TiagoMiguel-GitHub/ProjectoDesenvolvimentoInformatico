import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || "Erro ao iniciar sessão");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <h1 style={s.logo}>🌿 AgroWood</h1>
        <h2 style={s.title}>Painel de Administração</h2>
        <form onSubmit={handleSubmit} style={s.form}>
          <input style={s.input} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input style={s.input} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {error && <p style={s.error}>{error}</p>}
          <button style={s.btn} type="submit" disabled={loading}>{loading ? "A entrar..." : "Entrar"}</button>
        </form>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f0faf4", padding: 16 },
  card: { background: "#fff", padding: "clamp(24px, 5vw, 40px)", borderRadius: 16, width: "100%", maxWidth: 400, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" },
  logo: { textAlign: "center", fontSize: 36, marginBottom: 4 },
  title: { textAlign: "center", color: "#2d6a4f", marginBottom: 28, fontWeight: 700, fontSize: 18 },
  form: { display: "flex", flexDirection: "column", gap: 12 },
  input: { padding: "12px 14px", border: "1px solid #ccc", borderRadius: 10, fontSize: 15 },
  error: { color: "#ef4444", fontSize: 14, margin: 0 },
  btn: { padding: 14, background: "#2d6a4f", color: "#fff", border: "none", borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: "pointer" },
};
