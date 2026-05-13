import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  async function load() {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    setUsers(data ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function toggleRole(user: any) {
    const newRole = user.role === "admin" ? "customer" : "admin";
    await supabase.from("profiles").update({ role: newRole }).eq("id", user.id);
    load();
  }

  async function toggleActive(user: any) {
    await supabase.from("profiles").update({ is_active: !user.is_active }).eq("id", user.id);
    load();
  }

  const filtered = users.filter((u) =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.phone?.includes(search)
  );

  if (loading) return <div style={{ padding: 32 }}>A carregar...</div>;

  return (
    <div>
      <div style={s.header}>
        <h1 style={s.title}>Utilizadores</h1>
        <div style={s.stats}>
          <span style={s.stat}>{users.length} total</span>
          <span style={s.stat}>{users.filter((u) => u.role === "admin").length} admins</span>
          <span style={s.stat}>{users.filter((u) => u.is_active).length} ativos</span>
        </div>
      </div>

      <input
        style={s.search}
        placeholder="Pesquisar por nome, email ou telemóvel..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="table-scroll" style={s.tableWrap}>
        <div style={s.table}>
          <div style={s.thead}>
            <span>Nome</span>
            <span>Email</span>
            <span>Telemóvel</span>
            <span>Função</span>
            <span>Estado</span>
            <span>Registado em</span>
            <span>Ações</span>
          </div>
          {filtered.length === 0 && (
            <div style={{ padding: "20px 16px", color: "#888" }}>Nenhum utilizador encontrado.</div>
          )}
          {filtered.map((u) => (
            <div key={u.id} style={s.trow}>
              <div>
                <div style={{ fontWeight: 600, color: "#222" }}>{u.full_name || "—"}</div>
              </div>
              <span style={{ fontSize: 13, color: "#555" }}>{u.email || "—"}</span>
              <span style={{ fontSize: 13, color: "#555" }}>{u.phone || "—"}</span>
              <span style={{
                background: u.role === "admin" ? "#e8f5e9" : "#f0f0f0",
                color: u.role === "admin" ? "#2d6a4f" : "#555",
                padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap"
              }}>
                {u.role === "admin" ? "Admin" : "Cliente"}
              </span>
              <span style={{
                background: u.is_active ? "#dcfce7" : "#fee2e2",
                color: u.is_active ? "#16a34a" : "#dc2626",
                padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap"
              }}>
                {u.is_active ? "Ativo" : "Inativo"}
              </span>
              <span style={{ fontSize: 13, color: "#888", whiteSpace: "nowrap" }}>
                {new Date(u.created_at).toLocaleDateString("pt-PT")}
              </span>
              <div style={{ display: "flex", gap: 6 }}>
                <button style={s.roleBtn} onClick={() => toggleRole(u)}>
                  {u.role === "admin" ? "→ Cliente" : "→ Admin"}
                </button>
                <button
                  style={{ ...s.activeBtn, background: u.is_active ? "#fee2e2" : "#dcfce7", color: u.is_active ? "#dc2626" : "#16a34a" }}
                  onClick={() => toggleActive(u)}
                >
                  {u.is_active ? "Desativar" : "Ativar"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 },
  title: { color: "#2d6a4f", margin: 0 },
  stats: { display: "flex", gap: 12 },
  stat: { background: "#e8f5e9", color: "#2d6a4f", padding: "4px 14px", borderRadius: 20, fontSize: 13, fontWeight: 600 },
  search: { width: "100%", padding: "10px 14px", border: "1px solid #ccc", borderRadius: 8, fontSize: 14, marginBottom: 16, boxSizing: "border-box" },
  tableWrap: { borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  table: { background: "#fff", borderRadius: 12, overflow: "hidden", minWidth: 860 },
  thead: { display: "grid", gridTemplateColumns: "1.5fr 2fr 130px 100px 90px 110px 200px", gap: 12, padding: "12px 16px", background: "#f8f8f8", fontWeight: 600, color: "#555", fontSize: 13 },
  trow: { display: "grid", gridTemplateColumns: "1.5fr 2fr 130px 100px 90px 110px 200px", gap: 12, padding: "12px 16px", borderTop: "1px solid #f0f0f0", fontSize: 14, alignItems: "center" },
  roleBtn: { background: "#e8f0fe", color: "#1a56db", border: "none", padding: "5px 10px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" },
  activeBtn: { border: "none", padding: "5px 10px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" },
};
