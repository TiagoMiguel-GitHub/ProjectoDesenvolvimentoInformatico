import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV = [
  { path: "/", label: "📊 Dashboard" },
  { path: "/products", label: "🛍️ Produtos" },
  { path: "/orders", label: "📦 Encomendas" },
  { path: "/zones", label: "📍 Zonas de Entrega" },
  { path: "/schedule", label: "📅 Horários" },
  { path: "/simulator", label: "🧮 Simulador" },
  { path: "/users", label: "👥 Utilizadores" },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div style={s.wrapper}>
      {menuOpen && <div style={s.backdrop} onClick={() => setMenuOpen(false)} />}

      <aside className={`sidebar${menuOpen ? " open" : ""}`} style={s.sidebar}>
        <div style={s.brand}>🌿 AgroWood</div>
        <nav style={s.nav}>
          {NAV.map((n) => (
            <Link key={n.path} to={n.path} onClick={() => setMenuOpen(false)}
              style={{ ...s.navLink, ...(location.pathname === n.path ? s.navActive : {}) }}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div style={s.userInfo}>
          <div style={s.userName}>{user?.full_name}</div>
          <button style={s.logoutBtn} onClick={logout}>Sair</button>
        </div>
      </aside>

      <div style={s.contentWrap}>
        <header className="top-bar" style={s.topBar}>
          <button style={s.hamburger} onClick={() => setMenuOpen(!menuOpen)}>☰</button>
          <span style={s.topBarTitle}>🌿 AgroWood</span>
        </header>
        <main className="main-content" style={s.main}>{children}</main>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  wrapper: { display: "flex", minHeight: "100vh", background: "#f5f5f5" },
  backdrop: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 199 },
  sidebar: { width: 220, background: "#2d6a4f", display: "flex", flexDirection: "column", padding: "20px 0", flexShrink: 0 },
  brand: { color: "#fff", fontSize: 22, fontWeight: 700, padding: "0 20px 24px" },
  nav: { flex: 1, display: "flex", flexDirection: "column" },
  navLink: { color: "rgba(255,255,255,0.75)", padding: "12px 20px", textDecoration: "none", fontSize: 15, transition: "background 0.15s" },
  navActive: { background: "rgba(255,255,255,0.15)", color: "#fff", fontWeight: 600 },
  userInfo: { padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.2)" },
  userName: { color: "rgba(255,255,255,0.8)", fontSize: 13, marginBottom: 8 },
  logoutBtn: { background: "transparent", border: "1px solid rgba(255,255,255,0.4)", color: "#fff", padding: "6px 12px", borderRadius: 6, cursor: "pointer", fontSize: 13 },
  contentWrap: { flex: 1, display: "flex", flexDirection: "column", minWidth: 0 },
  topBar: { display: "none", alignItems: "center", gap: 12, padding: "12px 16px", background: "#2d6a4f", position: "sticky" as const, top: 0, zIndex: 100 },
  topBarTitle: { color: "#fff", fontWeight: 700, fontSize: 18 },
  hamburger: { background: "transparent", border: "none", color: "#fff", fontSize: 24, cursor: "pointer", lineHeight: 1, padding: "0 4px" },
  main: { flex: 1, padding: 32, overflowY: "auto" as const },
};
