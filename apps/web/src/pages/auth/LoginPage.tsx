import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { TreePine, Eye, EyeOff } from "lucide-react";
import { authApi } from "../../api/auth";
import { useAuth } from "../../context/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authApi.login(email, password);
      await refreshUser();
      navigate("/");
    } catch (err: any) {
      setError("Email ou password incorretos");
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
          <h1 className="text-3xl font-bold text-gray-900">Bem-vindo de volta</h1>
          <p className="text-gray-400 mt-2">Inicie sessão na sua conta AgroWood</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Email</label>
              <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="o-seu@email.pt" required />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input type={showPass ? "text" : "password"} className="input pr-12" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            {error && <p className="text-red-500 text-sm bg-red-50 px-4 py-3 rounded-xl">{error}</p>}
            <button type="submit" className="btn-primary w-full py-3 text-base" disabled={loading}>
              {loading ? "A entrar..." : "Iniciar sessão"}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-400 mt-6 text-sm">
          Não tem conta?{" "}
          <Link to="/registar" className="text-primary-500 font-semibold hover:underline">Criar conta grátis</Link>
        </p>
      </div>
    </div>
  );
}
