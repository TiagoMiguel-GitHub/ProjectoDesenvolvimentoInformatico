import { NavLink, Outlet, Navigate } from "react-router-dom";
import { User, Package, MapPin, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function ContaLayout() {
  const { user, loading, logout } = useAuth();

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>;
  if (!user) return <Navigate to="/login" replace />;

  const links = [
    { to: "/conta/perfil", label: "O meu perfil", icon: User },
    { to: "/conta/encomendas", label: "Encomendas", icon: Package },
    { to: "/conta/moradas", label: "Moradas", icon: MapPin },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="card p-4">
            <div className="flex items-center gap-3 px-3 py-4 mb-2 border-b border-gray-100">
              <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold">{user.full_name?.charAt(0)?.toUpperCase()}</span>
              </div>
              <div className="min-w-0">
                <p className="font-bold text-gray-900 truncate">{user.full_name}</p>
                <p className="text-xs text-gray-400 truncate">{user.email}</p>
              </div>
            </div>
            <nav className="space-y-1">
              {links.map(({ to, label, icon: Icon }) => (
                <NavLink key={to} to={to} className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive ? "bg-primary-50 text-primary-600" : "text-gray-600 hover:bg-gray-50"}`}>
                  <Icon className="w-4 h-4" /> {label}
                </NavLink>
              ))}
              <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all mt-2 border-t border-gray-100 pt-4">
                <LogOut className="w-4 h-4" /> Terminar sessão
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
