import { useEffect, useState } from "react";
import { api } from "../../api/client";

interface Slot {
  id: string;
  slot_date: string;
  start_time: string;
  end_time: string;
  max_orders: number;
  booked_count: number;
  slot_type: string;
  is_active: boolean;
}

const emptyForm = {
  mode: "single" as "single" | "range",
  slot_date: "",
  date_from: "",
  date_to: "",
  exclude_weekends: false,
  start_time: "",
  end_time: "",
  max_orders: "5",
  slot_type: "delivery",
};

function datesInRange(from: string, to: string, excludeWeekends: boolean): string[] {
  const dates: string[] = [];
  const cur = new Date(from + "T12:00:00");
  const end = new Date(to + "T12:00:00");
  while (cur <= end) {
    const day = cur.getDay();
    if (!excludeWeekends || (day !== 0 && day !== 6)) {
      dates.push(cur.toISOString().split("T")[0]);
    }
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

export default function SchedulePage() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    const today = new Date().toISOString().split("T")[0];
    const future = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const [d, p] = await Promise.all([
      api.get(`/schedule/slots?from_date=${today}&to_date=${future}&slot_type=delivery`),
      api.get(`/schedule/slots?from_date=${today}&to_date=${future}&slot_type=pickup`),
    ]);
    setSlots([...d.data, ...p.data].sort((a: Slot, b: Slot) => a.slot_date.localeCompare(b.slot_date) || a.start_time.localeCompare(b.start_time)));
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function setField(key: string, value: any) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function previewDates(): string[] {
    if (form.mode === "single") return form.slot_date ? [form.slot_date] : [];
    if (!form.date_from || !form.date_to || form.date_from > form.date_to) return [];
    return datesInRange(form.date_from, form.date_to, form.exclude_weekends);
  }

  async function save() {
    setError("");
    const dates = previewDates();
    if (dates.length === 0) {
      setError(form.mode === "single" ? "Selecione uma data" : "Selecione um intervalo de datas válido");
      return;
    }
    if (!form.start_time || !form.end_time) {
      setError("Hora de início e hora de fim são obrigatórios");
      return;
    }
    setSaving(true);
    try {
      await Promise.all(dates.map((d) =>
        api.post("/schedule/slots", {
          slot_date: d,
          start_time: form.start_time + ":00",
          end_time: form.end_time + ":00",
          max_orders: Number(form.max_orders),
          slot_type: form.slot_type,
        })
      ));
      setShowForm(false);
      setForm(emptyForm);
      load();
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Erro ao criar horários");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Remover este horário?")) return;
    await api.delete(`/schedule/slots/${id}`);
    load();
  }

  if (loading) return <div>A carregar...</div>;

  const grouped = slots.reduce<Record<string, Slot[]>>((acc, sl) => {
    (acc[sl.slot_date] = acc[sl.slot_date] || []).push(sl);
    return acc;
  }, {});

  const preview = previewDates();

  return (
    <div>
      <div style={s.header}>
        <h1 style={s.title}>Horários de Entrega</h1>
        <button style={s.addBtn} onClick={() => { setError(""); setForm(emptyForm); setShowForm(true); }}>+ Novo horário</button>
      </div>

      {Object.keys(grouped).length === 0 && (
        <div style={s.empty}>Nenhum horário disponível. Crie um para que os clientes possam fazer encomendas.</div>
      )}

      {Object.entries(grouped).map(([date, daySlots]) => (
        <div key={date} style={s.dayGroup}>
          <div style={s.dayHeader}>{formatDate(date)}</div>
          {daySlots.map((slot) => (
            <div key={slot.id} style={s.slotRow}>
              <span style={s.slotType(slot.slot_type)}>{slot.slot_type === "delivery" ? "🚚 Entrega" : "🏪 Levantamento"}</span>
              <span style={s.slotTime}>{slot.start_time.slice(0, 5)} – {slot.end_time.slice(0, 5)}</span>
              <span style={s.slotCapacity}>
                <span style={{ color: slot.booked_count >= slot.max_orders ? "#ef4444" : "#22c55e", fontWeight: 600 }}>
                  {slot.booked_count}/{slot.max_orders}
                </span> encomendas
              </span>
              <button style={s.deleteBtn} onClick={() => remove(slot.id)}>Remover</button>
            </div>
          ))}
        </div>
      ))}

      {showForm && (
        <div style={s.overlay}>
          <div className="modal-box" style={s.modal}>
            <h2 style={{ marginBottom: 16, color: "#2d6a4f" }}>Novo horário</h2>

            {/* Mode toggle */}
            <div style={s.modeToggle}>
              {(["single", "range"] as const).map((m) => (
                <button key={m} style={{ ...s.modeBtn, ...(form.mode === m ? s.modeBtnActive : {}) }} onClick={() => setField("mode", m)}>
                  {m === "single" ? "Dia único" : "Intervalo de datas"}
                </button>
              ))}
            </div>

            <label style={s.label}>Tipo</label>
            <select style={s.input} value={form.slot_type} onChange={(e) => setField("slot_type", e.target.value)}>
              <option value="delivery">🚚 Entrega</option>
              <option value="pickup">🏪 Levantamento</option>
            </select>

            {form.mode === "single" ? (
              <>
                <label style={s.label}>Data *</label>
                <input style={s.input} type="date" value={form.slot_date} onChange={(e) => setField("slot_date", e.target.value)} />
              </>
            ) : (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <label style={s.label}>De *</label>
                    <input style={s.input} type="date" value={form.date_from} onChange={(e) => setField("date_from", e.target.value)} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <label style={s.label}>Até *</label>
                    <input style={s.input} type="date" value={form.date_to} onChange={(e) => setField("date_to", e.target.value)} />
                  </div>
                </div>
                <label style={{ ...s.label, display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                  <input type="checkbox" checked={form.exclude_weekends} onChange={(e) => setField("exclude_weekends", e.target.checked)} />
                  Excluir fins-de-semana
                </label>
                {preview.length > 0 && (
                  <div style={s.previewBox}>
                    <span style={{ fontWeight: 600, color: "#2d6a4f" }}>{preview.length} dias selecionados:</span>{" "}
                    <span style={{ color: "#555", fontSize: 13 }}>{preview.map((d) => new Date(d + "T12:00:00").toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit" })).join(", ")}</span>
                  </div>
                )}
              </>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={s.label}>Hora início *</label>
                <input style={s.input} type="time" value={form.start_time} onChange={(e) => setField("start_time", e.target.value)} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={s.label}>Hora fim *</label>
                <input style={s.input} type="time" value={form.end_time} onChange={(e) => setField("end_time", e.target.value)} />
              </div>
            </div>

            <label style={s.label}>Máximo de encomendas</label>
            <input style={s.input} type="number" min="1" value={form.max_orders} onChange={(e) => setField("max_orders", e.target.value)} />

            {error && <p style={{ color: "#ef4444", fontSize: 13, margin: 0 }}>{error}</p>}

            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <button style={{ ...s.addBtn, opacity: saving ? 0.6 : 1 }} onClick={save} disabled={saving}>
                {saving ? "A criar..." : form.mode === "range" && preview.length > 1 ? `Criar ${preview.length} horários` : "Criar"}
              </button>
              <button style={s.cancelBtn} onClick={() => setShowForm(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function formatDate(d: string) {
  return new Date(d + "T12:00:00").toLocaleDateString("pt-PT", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

const s: Record<string, any> = {
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  title: { color: "#2d6a4f", margin: 0 },
  addBtn: { background: "#2d6a4f", color: "#fff", border: "none", padding: "10px 20px", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 14 },
  cancelBtn: { background: "#ef4444", color: "#fff", border: "none", padding: "10px 20px", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 14 },
  empty: { background: "#fff", borderRadius: 12, padding: 32, textAlign: "center", color: "#888" },
  dayGroup: { marginBottom: 20 },
  dayHeader: { fontWeight: 700, color: "#2d6a4f", marginBottom: 8, fontSize: 15, textTransform: "capitalize" },
  slotRow: { display: "flex", alignItems: "center", gap: 16, background: "#fff", borderRadius: 10, padding: "12px 16px", marginBottom: 6, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
  slotType: (type: string) => ({ background: type === "delivery" ? "#e8f5e9" : "#fef3c7", color: type === "delivery" ? "#2d6a4f" : "#92400e", padding: "3px 10px", borderRadius: 20, fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }),
  slotTime: { fontWeight: 600, color: "#333", minWidth: 110 },
  slotCapacity: { flex: 1, color: "#555", fontSize: 14 },
  deleteBtn: { background: "#fee2e2", color: "#ef4444", border: "none", padding: "5px 12px", borderRadius: 6, cursor: "pointer", fontWeight: 600, fontSize: 13 },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16 },
  modal: { background: "#fff", borderRadius: 16, padding: 28, display: "flex", flexDirection: "column", gap: 10 },
  label: { fontSize: 13, fontWeight: 600, color: "#555" },
  input: { padding: "10px 14px", border: "1px solid #ccc", borderRadius: 8, fontSize: 14 },
  modeToggle: { display: "flex", gap: 0, marginBottom: 4, border: "1px solid #ccc", borderRadius: 8, overflow: "hidden" },
  modeBtn: { flex: 1, padding: "9px 0", background: "#fff", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 500, color: "#555" },
  modeBtnActive: { background: "#2d6a4f", color: "#fff", fontWeight: 700 },
  previewBox: { background: "#f0faf4", border: "1px solid #c6e8d1", borderRadius: 8, padding: "8px 12px", fontSize: 13 },
};
