// Componente raiz do painel de administração.
// Define a estrutura de rotas: página de login pública e todas as outras protegidas.
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import LoginPage from "./pages/login/LoginPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import ProductsPage from "./pages/products/ProductsPage";
import OrdersPage from "./pages/orders/OrdersPage";
import ZonesPage from "./pages/zones/ZonesPage";
import SimulatorAdminPage from "./pages/simulator/SimulatorAdminPage";
import SchedulePage from "./pages/schedule/SchedulePage";
import UsersPage from "./pages/users/UsersPage";

// Guarda de acesso: redireciona para /login se não houver sessão de administrador ativa.
// Enquanto o estado de autenticação está a ser verificado, mostra uma mensagem de espera.
function ProtectedRoutes() {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>A carregar...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/zones" element={<ZonesPage />} />
        <Route path="/simulator" element={<SimulatorAdminPage />} />
        <Route path="/schedule" element={<SchedulePage />} />
        <Route path="/users" element={<UsersPage />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    // AuthProvider envolve o BrowserRouter para que o contexto de auth esteja
    // disponível em todas as rotas, incluindo a página de login
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          {/* Qualquer outra rota passa pela guarda de autenticação */}
          <Route path="/*" element={<ProtectedRoutes />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
