// Página inicial do painel de admin — apresenta estatísticas das encomendas e a lista mais recente.
// Todos os dados são calculados no cliente a partir das encomendas carregadas de uma vez.
import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

// Contagem de encomendas por estado, calculada a partir do array de encomendas
interface Stats { total: number; pending: number; confirmed: number; preparing: number; out_for_delivery: number; completed: number; }

export default function DashboardPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Carrega todas as encomendas com o nome do cliente (join com profiles)
  useEffect(() => {
    supabase.from("orders").select("*, profiles(full_name)").order("created_at", { ascending: false })
      .then(({ data }) => { setOrders(data ?? []); setLoading(false); });
  }, []);

  // Estatísticas calculadas no cliente — evita múltiplas queries à base de dados
  const stats: Stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    confirmed: orders.filter((o) => o.status === "confirmed").length,
    preparing: orders.filter((o) => o.status === "preparing").length,
    out_for_delivery: orders.filter((o) => o.status === "out_for_delivery").length,
    completed: orders.filter((o) => o.status === "completed").length,
  };
  // Receita total: soma apenas das encomendas concluídas
  const revenue = orders.filter((o) => o.status === "completed").reduce((s: number, o: any) => s + Number(o.total), 0);

  if (loading) return <div style={{ padding: 32 }}>A carregar...</div>;

  return (
    <div>
      <h1 style={s.title}>Dashboard</h1>
      {/* Grelha de cartões com as métricas principais */}
      <div style={s.grid}>
        <StatCard label="Total de encomendas" value={stats.total} color="#2d6a4f" />
        <StatCard label="Pendentes" value={stats.pending} color="#f59e0b" />
        <StatCard label="Em preparação" value={stats.preparing} color="#8b5cf6" />
        <StatCard label="Em entrega" value={stats.out_for_delivery} color="#f97316" />
        <StatCard label="Concluídas" value={stats.completed} color="#22c55e" />
        <StatCard label="Receita total" value={`€${revenue.toFixed(2)}`} color="#3b82f6" />
      </div>

      {/* Tabela com as 10 encomendas mais recentes */}
      <h2 style={{ marginTop: 32, marginBottom: 16, color: "#333" }}>Últimas encomendas</h2>
      <div className="table-scroll" style={s.tableWrap}>
        <div style={s.table}>
          <div style={s.tableHead}>
            <span>ID</span><span>Cliente</span><span>Total</span><span>Estado</span><span>Data</span>
          </div>
          {orders.slice(0, 10).map((o) => (
            <div key={o.id} style={s.tableRow}>
              <span style={{ fontFamily: "monospace" }}>#{o.id.slice(0, 8).toUpperCase()}</span>
              <span>{o.profiles?.full_name ?? "—"}</span>
              <span>€{Number(o.total).toFixed(2)}</span>
              <StatusBadge status={o.status} />
              <span>{new Date(o.created_at).toLocaleDateString("pt-PT")}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Cartão de estatística com barra colorida no topo para diferenciação visual
function StatCard({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div style={{ ...s.statCard, borderTop: `4px solid ${color}` }}>
      <div style={{ fontSize: 32, fontWeight: 700, color }}>{value}</div>
      <div style={{ color: "#777", marginTop: 4, fontSize: 14 }}>{label}</div>
    </div>
  );
}

// Badge colorido para o estado da encomenda — usa uma versão transparente da cor para o fundo
function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = { pending: "#f59e0b", confirmed: "#3b82f6", preparing: "#8b5cf6", out_for_delivery: "#f97316", completed: "#22c55e", cancelled: "#ef4444" };
  const labels: Record<string, string> = { pending: "Pendente", confirmed: "Confirmada", preparing: "Em preparação", out_for_delivery: "Em entrega", completed: "Concluída", cancelled: "Cancelada" };
  const c = colors[status] ?? "#999";
  return <span style={{ background: c + "22", color: c, padding: "3px 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>{labels[status] ?? status}</span>;
}

const s: Record<string, React.CSSProperties> = {
  title: { marginBottom: 24, color: "#2d6a4f" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 16 },
  statCard: { background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  tableWrap: { borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  table: { background: "#fff", borderRadius: 12, overflow: "hidden", minWidth: 560 },
  tableHead: { display: "grid", gridTemplateColumns: "140px 1fr 100px 150px 120px", gap: 12, padding: "12px 16px", background: "#f8f8f8", fontWeight: 600, color: "#555", fontSize: 13 },
  tableRow: { display: "grid", gridTemplateColumns: "140px 1fr 100px 150px 120px", gap: 12, padding: "12px 16px", borderTop: "1px solid #f0f0f0", fontSize: 14, alignItems: "center" },
};
