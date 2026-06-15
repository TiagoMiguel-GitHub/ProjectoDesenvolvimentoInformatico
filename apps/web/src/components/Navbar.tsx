// Barra de navegação superior — sticky (fica visível ao fazer scroll).
// Adapta-se a mobile com um menu hambúrguer e a desktop com links horizontais.
// Mostra opções diferentes consoante o utilizador esteja ou não autenticado.
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, User, Menu, X, TreePine } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart(); // número de unidades no carrinho para o badge
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false); // controla o menu mobile

  async function handleLogout() {
    await logout();
    navigate("/"); // redireciona para a homepage após terminar sessão
  }

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logótipo com ícone de árvore e nome da marca */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-primary-500 rounded-xl flex items-center justify-center group-hover:bg-primary-600 transition-colors">
              <TreePine className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Agro<span className="text-primary-500">Wood</span></span>
          </Link>

          {/* Links de navegação — apenas visíveis em ecrãs médios e maiores */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/loja" className="text-gray-600 hover:text-primary-500 font-medium transition-colors">Loja</Link>
            <Link to="/simulador" className="text-gray-600 hover:text-primary-500 font-medium transition-colors">Simulador</Link>
            {user && <Link to="/conta/encomendas" className="text-gray-600 hover:text-primary-500 font-medium transition-colors">Encomendas</Link>}
          </div>

          {/* Ações: ícone do carrinho (com badge) + menu de utilizador ou botão de login */}
          <div className="flex items-center gap-3">
            {/* Badge do carrinho — mostra o número total de unidades */}
            <Link to="/carrinho" className="relative p-2 rounded-xl hover:bg-gray-50 transition-colors">
              <ShoppingCart className="w-6 h-6 text-gray-700" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {user ? (
              // Dropdown do utilizador — ativa ao hover com CSS group/group-hover
              <div className="relative group hidden md:block">
                <button className="flex items-center gap-2 p-2 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">{user.full_name?.charAt(0)?.toUpperCase()}</span>
                  </div>
                </button>
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <Link to="/conta/perfil" className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-t-xl">O meu perfil</Link>
                  <Link to="/conta/encomendas" className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">Encomendas</Link>
                  <Link to="/conta/moradas" className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">Moradas</Link>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-50 rounded-b-xl">Terminar sessão</button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="hidden md:flex items-center gap-2 btn-primary text-sm py-2 px-4">
                <User className="w-4 h-4" /> Entrar
              </Link>
            )}

            {/* Botão hambúrguer — apenas em mobile */}
            <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menu mobile — dropdown vertical que abre abaixo da navbar */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-2">
          <Link to="/loja" onClick={() => setMenuOpen(false)} className="block py-2 text-gray-700 font-medium">Loja</Link>
          <Link to="/simulador" onClick={() => setMenuOpen(false)} className="block py-2 text-gray-700 font-medium">Simulador</Link>
          {user ? (
            <>
              <Link to="/conta/perfil" onClick={() => setMenuOpen(false)} className="block py-2 text-gray-700 font-medium">O meu perfil</Link>
              <Link to="/conta/encomendas" onClick={() => setMenuOpen(false)} className="block py-2 text-gray-700 font-medium">Encomendas</Link>
              <Link to="/conta/moradas" onClick={() => setMenuOpen(false)} className="block py-2 text-gray-700 font-medium">Moradas</Link>
              <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="block py-2 text-red-500 font-medium">Terminar sessão</button>
            </>
          ) : (
            <Link to="/login" onClick={() => setMenuOpen(false)} className="block py-2 text-primary-500 font-medium">Entrar / Registar</Link>
          )}
        </div>
      )}
    </nav>
  );
}
