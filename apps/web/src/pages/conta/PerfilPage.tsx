import { useState } from "react";
import { User, Save } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { authApi } from "../../api/auth";

export default function PerfilPage() {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState(user?.full_name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setSuccess(false); setError("");
    try {
      await authApi.updateMe({ full_name: name.trim(), phone: phone.trim() || undefined });
      await refreshUser();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("Não foi possível guardar as alterações");
    } finally { setSaving(false); }
  }

  return (
    <div className="max-w-xl space-y-6">
      <div className="card p-6 flex items-center gap-5">
        <div className="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center flex-shrink-0">
          <span className="text-white text-2xl font-bold">{user?.full_name?.charAt(0)?.toUpperCase()}</span>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{user?.full_name}</h2>
          <p className="text-gray-400 text-sm">{user?.email}</p>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2"><User className="w-5 h-5 text-primary-500" /> Editar perfil</h3>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">Nome completo</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="O seu nome" />
          </div>
          <div>
            <label className="label">Telemóvel</label>
            <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+351 9XX XXX XXX" type="tel" />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input bg-gray-50 cursor-not-allowed" value={user?.email ?? ""} disabled />
            <p className="text-xs text-gray-400 mt-1">O email não pode ser alterado.</p>
          </div>
          {success && <p className="text-green-600 bg-green-50 px-4 py-3 rounded-xl text-sm">✅ Perfil atualizado com sucesso!</p>}
          {error && <p className="text-red-500 bg-red-50 px-4 py-3 rounded-xl text-sm">{error}</p>}
          <button type="submit" className="btn-primary flex items-center gap-2" disabled={saving}>
            <Save className="w-4 h-4" /> {saving ? "A guardar..." : "Guardar alterações"}
          </button>
        </form>
      </div>
    </div>
  );
}
