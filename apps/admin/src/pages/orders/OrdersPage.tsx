import React, { useEffect, useState } from "react";
import { api } from "../../api/client";

const STATUS_OPTIONS = ["pending", "confirmed", "preparing", "out_for_delivery", "completed", "cancelled"];
const STATUS_LABELS: Record<string, string> = { pending: "Pendente", confirmed: "Confirmada", preparing: "Em preparação", out_for_delivery: "Em entrega", completed: "Concluída", cancelled: "Cancelada" };
const STATUS_COLORS: Record<string, string> = { pending: "#f59e0b", confirmed: "#3b82f6", preparing: "#8b5cf6", out_for_delivery: "#f97316", completed: "#22c55e", cancelled: "#ef4444" };

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>("");
  const [selected, setSelected] = useState<any>(null);
  const [newStatus, setNewStatus] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    const params = filter ? { status: filter } : {};
    api.get("/orders", { params }).then(({ data }) => setOrders(data)).finally(() => setLoading(false));
  }
  useEffect(() => { load(); }, [filter]);

  async function updateStatus() {
    if (!newStatus || !selected) return;
    await api.patch(`/orders/${selected.id}/status`, { status: newStatus, note: note || undefined });
    setSelected(null);
    setNote("");
    load();
  }

  if (loading) return <div style={{ padding: 32 }}>A carregar...</div>;

  return (
    <div>
      <h1 style={{ color: "#2d6a4f", marginBottom: 20 }}>Encomendas</h1>

      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        <button style={{ ...s.filterBtn, ...(filter === "" ? s.filterActive : {}) }} onClick={() => setFilter("")}>Todas</button>
        {STATUS_OPTIONS.map((st) => (
          <button key={st} style={{ ...s.filterBtn, ...(filter === st ? s.filterActive : {}) }} onClick={() => setFilter(st)}>{STATUS_LABELS[st]}</button>
        ))}
      </div>

      <div className="table-scroll" style={s.tableWrap}>
        <div style={s.table}>
          <div style={s.thead}><span>ID</span><span>Tipo</span><span>Pagamento</span><span>Total</span><span>Estado</span><span>Data</span><span></span></div>
          {orders.map((o) => {
            const c = STATUS_COLORS[o.status] ?? "#999";
            return (
              <div key={o.id} style={s.trow}>
                <span style={{ fontFamily: "monospace", fontSize: 12 }}>#{o.id.slice(0, 8).toUpperCase()}</span>
                <span style={{ whiteSpace: "nowrap" }}>{o.fulfillment_type === "delivery" ? "🚚 Entrega" : "🏪 Levant."}</span>
                <span style={{ fontSize: 13 }}>{o.payment_method}</span>
                <span style={{ fontWeight: 700, color: "#2d6a4f", whiteSpace: "nowrap" }}>€{Number(o.total).toFixed(2)}</span>
                <span style={{ background: c + "22", color: c, padding: "3px 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>{STATUS_LABELS[o.status]}</span>
                <span style={{ fontSize: 13, color: "#888", whiteSpace: "nowrap" }}>{new Date(o.created_at).toLocaleDateString("pt-PT")}</span>
                <button style={s.viewBtn} onClick={() => { setSelected(o); setNewStatus(o.status); }}>Ver / Atualizar</button>
              </div>
            );
          })}
        </div>
      </div>

      {selected && (
        <div style={s.overlay}>
          <div className="modal-box" style={s.modal}>
            <h2 style={{ color: "#2d6a4f", marginBottom: 16 }}>Encomenda #{selected.id.slice(0, 8).toUpperCase()}</h2>

            <div style={{ marginBottom: 16 }}>
              {selected.items.map((item: any) => (
                <div key={item.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, gap: 8 }}>
                  <span>{item.product.name} × {item.quantity} {item.product.unit}</span>
                  <span style={{ whiteSpace: "nowrap" }}>€{Number(item.total_price).toFixed(2)}</span>
                </div>
              ))}
              <div style={{ borderTop: "1px solid #eee", paddingTop: 8, display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
                <span>Total</span><span style={{ color: "#2d6a4f" }}>€{Number(selected.total).toFixed(2)}</span>
              </div>
            </div>

            {selected.address && (
              <p style={{ color: "#555", fontSize: 14, marginBottom: 16 }}>
                📍 {selected.address.street}, {selected.address.city} {selected.address.postal_code}
              </p>
            )}

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
  filterBtn: { padding: "7px 14px", border: "1px solid #ccc", borderRadius: 20, background: "#fff", cursor: "pointer", fontSize: 13 },
  filterActive: { background: "#2d6a4f", color: "#fff", border: "1px solid #2d6a4f" },
  tableWrap: { borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  table: { background: "#fff", borderRadius: 12, overflow: "hidden", minWidth: 700 },
  thead: { display: "grid", gridTemplateColumns: "130px 1fr 130px 100px 140px 100px 140px", gap: 12, padding: "12px 16px", background: "#f8f8f8", fontWeight: 600, color: "#555", fontSize: 13 },
  trow: { display: "grid", gridTemplateColumns: "130px 1fr 130px 100px 140px 100px 140px", gap: 12, padding: "12px 16px", borderTop: "1px solid #f0f0f0", fontSize: 14, alignItems: "center" },
  viewBtn: { background: "#2d6a4f", color: "#fff", border: "none", padding: "8px 12px", borderRadius: 6, cursor: "pointer", fontSize: 13, whiteSpace: "nowrap" },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16 },
  modal: { background: "#fff", borderRadius: 16, padding: 32, display: "flex", flexDirection: "column", gap: 8 },
  label: { fontSize: 13, fontWeight: 600, color: "#555" },
  input: { padding: "10px 14px", border: "1px solid #ccc", borderRadius: 8, fontSize: 14 },
  saveBtn: { background: "#2d6a4f", color: "#fff", border: "none", padding: "10px 20px", borderRadius: 8, fontWeight: 700, cursor: "pointer" },
  cancelBtn: { background: "#f3f4f6", border: "none", padding: "10px 20px", borderRadius: 8, cursor: "pointer" },
};
