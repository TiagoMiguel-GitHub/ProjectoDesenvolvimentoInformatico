import React, { useEffect, useState } from "react";
import { api } from "../../api/client";

export default function SimulatorAdminPage() {
  const [configs, setConfigs] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ wood_type: "", price_per_unit: "", unit: "m3", transport_cost_per_km: "0", min_transport_cost: "0", description: "" });

  async function load() {
    api.get("/simulator/configs").then(({ data }) => setConfigs(data));
  }
  useEffect(() => { load(); }, []);

  async function save() {
    await api.post("/simulator/configs", { ...form, price_per_unit: Number(form.price_per_unit), transport_cost_per_km: Number(form.transport_cost_per_km), min_transport_cost: Number(form.min_transport_cost) });
    setShowForm(false);
    load();
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ color: "#2d6a4f", margin: 0 }}>Simulador de Orçamento</h1>
        <button style={s.addBtn} onClick={() => setShowForm(true)}>+ Novo tipo de madeira</button>
      </div>

      <div style={s.grid}>
        {configs.map((c) => (
          <div key={c.id} style={s.card}>
            <div style={s.cardTitle}>{c.wood_type}</div>
            <div style={s.cardPrice}>€{Number(c.price_per_unit).toFixed(2)} / {c.unit}</div>
            {c.description && <div style={s.cardDesc}>{c.description}</div>}
            <div style={s.cardMeta}>Transporte: €{Number(c.transport_cost_per_km).toFixed(2)}/km</div>
            <div style={s.cardMeta}>Custo mínimo: €{Number(c.min_transport_cost).toFixed(2)}</div>
          </div>
        ))}
      </div>

      {showForm && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <h2 style={{ color: "#2d6a4f", marginBottom: 16 }}>Novo tipo de madeira</h2>
            <input style={s.input} placeholder="Tipo (ex: Eucalipto)" value={form.wood_type} onChange={(e) => setForm({ ...form, wood_type: e.target.value })} />
            <input style={s.input} type="number" placeholder="Preço por unidade (€)" value={form.price_per_unit} onChange={(e) => setForm({ ...form, price_per_unit: e.target.value })} />
            <select style={s.input} value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
              {["m3", "m2", "unidade", "tonelada"].map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
            <input style={s.input} type="number" placeholder="Custo transporte (€/km)" value={form.transport_cost_per_km} onChange={(e) => setForm({ ...form, transport_cost_per_km: e.target.value })} />
            <input style={s.input} type="number" placeholder="Custo mínimo transporte (€)" value={form.min_transport_cost} onChange={(e) => setForm({ ...form, min_transport_cost: e.target.value })} />
            <input style={s.input} placeholder="Descrição (opcional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
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
  addBtn: { background: "#2d6a4f", color: "#fff", border: "none", padding: "10px 20px", borderRadius: 8, fontWeight: 700, cursor: "pointer" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 },
  card: { background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  cardTitle: { fontWeight: 700, fontSize: 17, color: "#333", marginBottom: 6 },
  cardPrice: { fontSize: 20, fontWeight: 700, color: "#2d6a4f", marginBottom: 8 },
  cardDesc: { color: "#888", fontSize: 13, marginBottom: 8 },
  cardMeta: { color: "#555", fontSize: 13 },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 },
  modal: { background: "#fff", borderRadius: 16, padding: 32, width: 440, display: "flex", flexDirection: "column", gap: 10 },
  input: { padding: "10px 14px", border: "1px solid #ccc", borderRadius: 8, fontSize: 14 },
  cancelBtn: { background: "#f3f4f6", border: "none", padding: "10px 20px", borderRadius: 8, cursor: "pointer" },
};
