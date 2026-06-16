// Página de gestão de encomendas do painel de admin.
// Lista todas as encomendas com filtro por estado e permite atualizar o estado via modal.
import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

// Estados possíveis de uma encomenda, pela ordem do ciclo de vida
const STATUS_OPTIONS = ["pending", "confirmed", "preparing", "out_for_delivery", "completed", "cancelled"];

// Tradução e cor associada a cada estado (cor usada no badge com transparência de 22%)
const STATUS_LABELS: Record<string, string> = { pending: "Pendente", confirmed: "Confirmada", preparing: "Em preparação", out_for_delivery: "Em entrega", completed: "Concluída", cancelled: "Cancelada" };
const STATUS_COLORS: Record<string, string> = { pending: "#f59e0b", confirmed: "#3b82f6", preparing: "#8b5cf6", out_for_delivery: "#f97316", completed: "#22c55e", cancelled: "#ef4444" };

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>(""); // "" = todas as encomendas
  const [selected, setSelected] = useState<any>(null); // encomenda aberta no modal
  const [newStatus, setNewStatus] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);

  // Carrega encomendas com relações expandidas — filtra por estado se houver filtro ativo
  async function load() {
    let query = supabase.from("orders").select("*, customer:profiles(full_name), address:addresses(*), items:order_items(*, product:products(*))").order("created_at", { ascending: false });
    if (filter) query = query.eq("status", filter);
    const { data, error } = await query;
    if (error) console.error("Erro ao carregar encomendas:", error);
    setOrders(data ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, [filter]);

  // Atualiza o estado da encomenda e opcionalmente regista uma nota no histórico
  async function updateStatus() {
    if (!newStatus || !selected) return;
    await supabase.from("orders").update({ status: newStatus }).eq("id", selected.id);
    if (note) {
      // O histórico de estados permite rastrear alterações com notas do operador
      await supabase.from("order_status_history").insert({ order_id: selected.id, status: newStatus, note });
    }
    setSelected(null);
    setNote("");
    load();
  }

  if (loading) return <div style={{ padding: 32 }}>A carregar...</div>;

  return (
    <div>
      <h1 style={{ color: "#2d6a4f", marginBottom: 20 }}>Encomendas</h1>

      {/* Botões de filtro por estado */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        <button style={{ ...s.filterBtn, ...(filter === "" ? s.filterActive : {}) }} onClick={() => setFilter("")}>Todas</button>
        {STATUS_OPTIONS.map((st) => (
          <button key={st} style={{ ...s.filterBtn, ...(filter === st ? s.filterActive : {}) }} onClick={() => setFilter(st)}>{STATUS_LABELS[st]}</button>
        ))}
      </div>

      {/* Tabela de encomendas */}
      <div className="table-scroll" style={s.tableWrap}>
        <div style={s.table}>
          <div style={s.thead}>
            <span>ID</span><span>Cliente</span><span>Tipo</span><span>Total</span><span>Estado</span><span>Data</span><span></span>
          </div>
          {orders.map((o) => {
            const c = STATUS_COLORS[o.status] ?? "#999";
            return (
              <div key={o.id} style={s.trow}>
                <span style={{ fontFamily: "monospace", fontSize: 12, whiteSpace: "nowrap" }}>#{o.id.slice(0, 8).toUpperCase()}</span>
                <span style={{ fontWeight: 600, color: "#333", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0 }}>{o.customer?.full_name ?? "—"}</span>
                <span style={{ whiteSpace: "nowrap" }}>{o.fulfillment_type === "delivery" ? "🚚 Entrega" : "🏪 Levant."}</span>
                <span style={{ fontWeight: 700, color: "#2d6a4f", whiteSpace: "nowrap" }}>€{Number(o.total).toFixed(2)}</span>
                <span style={{ background: c + "22", color: c, padding: "3px 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", textAlign: "center" }}>{STATUS_LABELS[o.status]}</span>
                <span style={{ fontSize: 13, color: "#888", whiteSpace: "nowrap" }}>{new Date(o.created_at).toLocaleDateString("pt-PT")}</span>
                <button style={s.viewBtn} onClick={() => { setSelected(o); setNewStatus(o.status); }}>Ver / Atualizar</button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal de detalhe e atualização de estado */}
      {selected && (
        <div style={s.overlay}>
          <div className="modal-box" style={s.modal}>
            <h2 style={{ color: "#2d6a4f", marginBottom: 4 }}>Encomenda #{selected.id.slice(0, 8).toUpperCase()}</h2>
            {selected.customer?.full_name && (
              <p style={{ color: "#555", fontSize: 14, marginBottom: 16 }}>👤 {selected.customer.full_name}</p>
            )}

            {/* Lista de itens da encomenda com preço total por linha */}
            {/* Tipo de entrega e método de pagamento */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
              <span style={{ background: selected.fulfillment_type === "delivery" ? "#dbeafe" : "#f3e8ff", color: selected.fulfillment_type === "delivery" ? "#1d4ed8" : "#7c3aed", padding: "4px 12px", borderRadius: 12, fontSize: 13, fontWeight: 600 }}>
                {selected.fulfillment_type === "delivery" ? "🚚 Entrega ao domicílio" : "🏪 Levantamento em loja"}
              </span>
              {selected.payment_method && (
                <span style={{ background: "#fef3c7", color: "#92400e", padding: "4px 12px", borderRadius: 12, fontSize: 13, fontWeight: 600 }}>
                  {{ cash_on_delivery: "💵 Dinheiro", mbway: "📱 MB Way", multibanco: "🏧 Multibanco" }[selected.payment_method as string] ?? selected.payment_method}
                </span>
              )}
            </div>

            {/* Morada de entrega */}
            {selected.fulfillment_type === "delivery" && (
              <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "12px 14px", marginBottom: 16 }}>
                <p style={{ fontWeight: 600, color: "#555", fontSize: 13, margin: "0 0 4px" }}>📍 Morada de entrega</p>
                {selected.address ? (
                  <p style={{ color: "#333", fontSize: 14, margin: 0 }}>
                    {selected.address.street}, {selected.address.city} {selected.address.postal_code}
                    {selected.address.label ? <span style={{ color: "#888", fontSize: 12 }}> ({selected.address.label})</span> : null}
                  </p>
                ) : (
                  <p style={{ color: "#e11d48", fontSize: 13, margin: 0 }}>Morada não encontrada</p>
                )}
              </div>
            )}

            {/* Notas do cliente */}
            {selected.notes && (
              <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "10px 14px", marginBottom: 16 }}>
                <p style={{ fontWeight: 600, color: "#92400e", fontSize: 13, margin: "0 0 4px" }}>📝 Nota</p>
                <p style={{ color: "#333", fontSize: 14, margin: 0 }}>{selected.notes}</p>
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              {selected.items?.map((item: any) => (
                <div key={item.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, gap: 8 }}>
                  <span>{item.product?.name} × {item.quantity} {item.product?.unit}</span>
                  <span style={{ whiteSpace: "nowrap" }}>€{Number(item.total_price).toFixed(2)}</span>
                </div>
              ))}
              <div style={{ borderTop: "1px solid #eee", paddingTop: 8, display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
                <span>Total</span><span style={{ color: "#2d6a4f" }}>€{Number(selected.total).toFixed(2)}</span>
              </div>
            </div>

            <label style={s.label}>Atualizar estado</label>
            <select style={s.input} value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
              {STATUS_OPTIONS.map((st) => <option key={st} value={st}>{STATUS_LABELS[st]}</option>)}
            </select>
            <input style={s.input} placeholder="Nota (opcional)" value={note} onChange={(e) => setNote(e.target.value)} />

            <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
              <button style={s.saveBtn} onClick={updateStatus}>Guardar</button>
              <button style={s.cancelBtn} onClick={() => setSelected(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  filterBtn: { padding: "7px 14px", border: "1px solid #ccc", borderRadius: 20, background: "#fff", color: "#333", cursor: "pointer", fontSize: 13 },
  filterActive: { background: "#2d6a4f", color: "#fff", border: "1px solid #2d6a4f" },
  tableWrap: { borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", overflowX: "auto" },
  table: { background: "#fff", borderRadius: 12, overflow: "hidden", minWidth: 780 },
  thead: { display: "grid", gridTemplateColumns: "105px minmax(0,1fr) 105px 90px 135px 95px 130px", gap: 12, padding: "12px 16px", background: "#f8f8f8", fontWeight: 600, color: "#555", fontSize: 13, alignItems: "center" },
  trow: { display: "grid", gridTemplateColumns: "105px minmax(0,1fr) 105px 90px 135px 95px 130px", gap: 12, padding: "12px 16px", borderTop: "1px solid #f0f0f0", fontSize: 14, alignItems: "center" },
  viewBtn: { background: "#2d6a4f", color: "#fff", border: "none", padding: "8px 12px", borderRadius: 6, cursor: "pointer", fontSize: 13, whiteSpace: "nowrap", width: "100%" },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16 },
  modal: { background: "#fff", borderRadius: 16, padding: 32, display: "flex", flexDirection: "column", gap: 8 },
  label: { fontSize: 13, fontWeight: 600, color: "#555" },
  input: { padding: "10px 14px", border: "1px solid #ccc", borderRadius: 8, fontSize: 14 },
  saveBtn: { background: "#2d6a4f", color: "#fff", border: "none", padding: "10px 20px", borderRadius: 8, fontWeight: 700, cursor: "pointer" },
  cancelBtn: { background: "#f3f4f6", border: "none", padding: "10px 20px", borderRadius: 8, cursor: "pointer" },
};
