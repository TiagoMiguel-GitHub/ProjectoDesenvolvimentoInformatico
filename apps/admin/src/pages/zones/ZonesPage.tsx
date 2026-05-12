import React, { useEffect, useState } from "react";
import { api } from "../../api/client";

export default function ZonesPage() {
  const [zones, setZones] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", postal_codes: "", delivery_cost: "", free_delivery_threshold: "" });
  const [error, setError] = useState("");

  async function load() {
    const { data } = await api.get("/delivery-zones");
    setZones(data);
  }
  useEffect(() => { load(); }, []);

  async function save() {
    setError("");
    if (!form.name || !form.postal_codes || !form.delivery_cost) {
      setError("Nome, códigos postais e custo de entrega são obrigatórios");
      return;
    }
    try {
      await api.post("/delivery-zones", {
        ...form,
        delivery_cost: Number(form.delivery_cost),
        free_delivery_threshold: form.free_delivery_threshold ? Number(form.free_delivery_threshold) : null,
      });
      setShowForm(false);
      setForm({ name: "", postal_codes: "", delivery_cost: "", free_delivery_threshold: "" });
      load();
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Erro ao guardar zona");
    }
  }

  return (
    <div>
      <div style={s.header}>
        <h1 style={s.title}>Zonas de Entrega</h1>
        <button style={s.addBtn} onClick={() => { setError(""); setShowForm(true); }}>+ Nova zona</button>
      </div>

      <div className="table-scroll" style={s.tableWrap}>
        <div style={s.table}>
          <div style={s.thead}><span>Nome</span><span>Códigos postais</span><span>Custo</span><span>Entrega grátis a partir de</span></div>
          {zones.length === 0 && (
            <div style={{ padding: "20px 16px", color: "#888", fontSize: 14 }}>Nenhuma zona configurada ainda.</div>
          )}
          {zones.map((z) => (
            <div key={z.id} style={s.trow}>
              <span style={{ fontWeight: 600 }}>{z.name}</span>
              <span style={{ fontSize: 13, color: "#888" }}>{z.postal_codes}</span>
              <span style={{ whiteSpace: "nowrap" }}>€{Number(z.delivery_cost).toFixed(2)}</span>
              <span style={{ whiteSpace: "nowrap" }}>{z.free_delivery_threshold ? `€${Number(z.free_delivery_threshold).toFixed(2)}` : "—"}</span>
            </div>
          ))}
        </div>
      </div>

      {showForm && (
        <div style={s.overlay}>
          <div className="modal-box-sm" style={s.modal}>
            <h2 style={{ color: "#2d6a4f", marginBottom: 16 }}>Nova zona de entrega</h2>
            <input style={s.input} placeholder="Nome (ex: Aveiro Centro)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input style={s.input} placeholder="Códigos postais (ex: 3800,3810)" value={form.postal_codes} onChange={(e) => setForm({ ...form, postal_codes: e.target.value })} />
            <input style={s.input} type="number" placeholder="Custo de entrega (€)" value={form.delivery_cost} onChange={(e) => setForm({ ...form, delivery_cost: e.target.value })} />
            <input style={s.input} type="number" placeholder="Entrega grátis a partir de (€, opcional)" value={form.free_delivery_threshold} onChange={(e) => setForm({ ...form, free_delivery_threshold: e.target.value })} />
            {error && <p style={{ color: "#ef4444", fontSize: 13, margin: 0 }}>{error}</p>}
            <div style={{ display: "flex", gap: 10 }}>
              <button style={s.addBtn} onClick={save}>Guardar</button>
              <button style={s.cancelBtn} onClick={() => setShowForm(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 },
  title: { color: "#2d6a4f", margin: 0 },
  addBtn: { background: "#2d6a4f", color: "#fff", border: "none", padding: "10px 20px", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 14 },
  cancelBtn: { background: "#f3f4f6", border: "none", padding: "10px 20px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 14 },
  tableWrap: { borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  table: { background: "#fff", borderRadius: 12, overflow: "hidden", minWidth: 500 },
  thead: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, padding: "12px 16px", background: "#f8f8f8", fontWeight: 600, color: "#555", fontSize: 13 },
  trow: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, padding: "12px 16px", borderTop: "1px solid #f0f0f0", fontSize: 14 },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16 },
  modal: { background: "#fff", borderRadius: 16, padding: 28, display: "flex", flexDirection: "column", gap: 10 },
  input: { padding: "10px 14px", border: "1px solid #ccc", borderRadius: 8, fontSize: 14 },
};
