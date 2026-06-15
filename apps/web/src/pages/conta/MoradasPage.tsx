import { useEffect, useState } from "react";
import { MapPin, Plus, Trash2, Star } from "lucide-react";
import { authApi } from "../../api/auth";
import type { Address } from "../../types";

function formatPostalCode(text: string): string {
  const digits = text.replace(/\D/g, "").slice(0, 7);
  return digits.length > 4 ? `${digits.slice(0,4)}-${digits.slice(4)}` : digits;
}

export default function MoradasPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ label: "", street: "", city: "", postal_code: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    const { data } = await authApi.listAddresses();
    setAddresses(data);
  }

  useEffect(() => { load(); }, []);

  async function save() {
    setError("");
    if (!form.street || !form.city || !form.postal_code) { setError("Rua, cidade e código postal são obrigatórios"); return; }
    if (!/^\d{4}-\d{3}$/.test(form.postal_code)) { setError("Código postal inválido (ex: 3030-112)"); return; }
    setSaving(true);
    try {
      await authApi.addAddress(form as any);
      setShowForm(false);
      setForm({ label: "", street: "", city: "", postal_code: "" });
      load();
    } catch (e: any) { setError(e?.message || "Erro ao guardar morada"); }
    finally { setSaving(false); }
  }

  async function remove(id: string) {
    if (!confirm("Tem a certeza que quer remover esta morada?")) return;
    await authApi.deleteAddress(id);
    load();
  }

  return (
    <div className="max-w-2xl space-y-4">
      {addresses.map((a) => (
        <div key={a.id} className={`card p-5 flex items-start gap-4 ${a.is_default ? "ring-2 ring-primary-500" : ""}`}>
          <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <MapPin className="w-5 h-5 text-primary-500" />
          </div>
          <div className="flex-1">
            {a.label && <p className="font-bold text-primary-500 text-sm mb-1">{a.label}</p>}
            <p className="font-semibold text-gray-900">{a.street}</p>
            <p className="text-sm text-gray-400">{a.postal_code} {a.city}</p>
            {a.is_default ? (
              <span className="inline-flex items-center gap-1 text-xs text-primary-500 font-semibold mt-2"><Star className="w-3 h-3 fill-current" /> Predefinida</span>
            ) : (
              <button onClick={() => authApi.setDefaultAddress(a.id).then(load)} className="text-xs text-gray-400 hover:text-primary-500 mt-2 underline transition-colors">
                Definir como predefinida
              </button>
            )}
          </div>
          <button onClick={() => remove(a.id)} className="p-2 text-gray-300 hover:text-red-400 transition-colors">
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      ))}

      {showForm ? (
        <div className="card p-6 space-y-4">
          <h3 className="font-bold text-gray-900">Nova morada</h3>
          <div><label className="label">Etiqueta (opcional)</label><input className="input" placeholder="Ex: Casa, Escritório" value={form.label} onChange={(e) => setForm(f => ({...f, label: e.target.value}))} /></div>
          <div><label className="label">Rua e número *</label><input className="input" placeholder="Rua das Flores, 10" value={form.street} onChange={(e) => setForm(f => ({...f, street: e.target.value}))} /></div>
          <div><label className="label">Cidade *</label><input className="input" placeholder="Coimbra" value={form.city} onChange={(e) => setForm(f => ({...f, city: e.target.value}))} /></div>
          <div><label className="label">Código postal *</label><input className="input" placeholder="3030-112" value={form.postal_code} onChange={(e) => setForm(f => ({...f, postal_code: formatPostalCode(e.target.value)}))} /></div>
          {error && <p className="text-red-500 text-sm bg-red-50 px-4 py-3 rounded-xl">{error}</p>}
          <div className="flex gap-3">
            <button onClick={save} className="btn-primary flex-1" disabled={saving}>{saving ? "A guardar..." : "Guardar"}</button>
            <button onClick={() => setShowForm(false)} className="btn-outline flex-1">Cancelar</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowForm(true)} className="card p-5 w-full flex items-center gap-3 text-primary-500 font-semibold hover:shadow-md transition-all border-2 border-dashed border-primary-200 hover:border-primary-400">
          <Plus className="w-5 h-5" /> Adicionar nova morada
        </button>
      )}
    </div>
  );
}
