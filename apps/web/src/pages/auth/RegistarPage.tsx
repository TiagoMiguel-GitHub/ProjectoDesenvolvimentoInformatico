import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { TreePine } from "lucide-react";
import { authApi } from "../../api/auth";

export default function RegistarPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 6) { setError("A password deve ter pelo menos 6 caracteres"); return; }
    setLoading(true);
    try {
      await authApi.register(email, password, name);
      navigate("/login?registered=1");
    } catch (err: any) {
      setError(err.message || "Erro ao criar conta");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <TreePine className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Criar conta</h1>
          <p className="text-gray-400 mt-2">Junte-se à AgroWood hoje</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Nome completo</label>
              <input type="text" className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="O seu nome" required />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="o-seu@email.pt" required />
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" required />
            </div>
            {error && <p className="text-red-500 text-sm bg-red-50 px-4 py-3 rounded-xl">{error}</p>}
            <button type="submit" className="btn-primary w-full py-3 text-base" disabled={loading}>
              {loading ? "A criar conta..." : "Criar conta"}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-400 mt-6 text-sm">
          Já tem conta?{" "}
          <Link to="/login" className="text-primary-500 font-semibold hover:underline">Iniciar sessão</Link>
        </p>
      </div>
    </div>
  );
}
