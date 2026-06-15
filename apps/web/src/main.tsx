// Ponto de entrada da aplicação web.
// Monta a árvore de componentes React no elemento #root do index.html.
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import HomePage from "./pages/HomePage";
import LojaPage from "./pages/loja/LojaPage";
import ProdutoPage from "./pages/loja/ProdutoPage";
import CarrinhoPage from "./pages/carrinho/CarrinhoPage";
import CheckoutPage from "./pages/checkout/CheckoutPage";
import SimuladorPage from "./pages/simulador/SimuladorPage";
import LoginPage from "./pages/auth/LoginPage";
import RegistarPage from "./pages/auth/RegistarPage";
import ContaLayout from "./pages/conta/ContaLayout";
import PerfilPage from "./pages/conta/PerfilPage";
import EncomendasPage from "./pages/conta/EncomendasPage";
import EncomendaDetalhe from "./pages/conta/EncomendaDetalhe";
import MoradasPage from "./pages/conta/MoradasPage";

ReactDOM.createRoot(document.getElementById("root")!).render(
  // StrictMode ativa verificações extra em desenvolvimento (detetação de efeitos duplos, APIs obsoletas)
  <React.StrictMode>
    {/* BrowserRouter usa a History API do browser para navegação sem recarregar a página */}
    <BrowserRouter>
      {/* AuthProvider e CartProvider envolvem toda a app para que qualquer componente
          possa aceder ao utilizador autenticado e ao estado do carrinho */}
      <AuthProvider>
        <CartProvider>
          {/* Layout base: navbar fixa no topo, conteúdo principal e footer */}
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/loja" element={<LojaPage />} />
                <Route path="/produto/:id" element={<ProdutoPage />} />
                <Route path="/carrinho" element={<CarrinhoPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/simulador" element={<SimuladorPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/registar" element={<RegistarPage />} />
                {/* Rotas da área pessoal com layout partilhado (sidebar + outlet) */}
                <Route path="/conta" element={<ContaLayout />}>
                  <Route index element={<Navigate to="/conta/perfil" replace />} />
                  <Route path="perfil" element={<PerfilPage />} />
                  <Route path="encomendas" element={<EncomendasPage />} />
                  <Route path="encomendas/:id" element={<EncomendaDetalhe />} />
                  <Route path="moradas" element={<MoradasPage />} />
                </Route>
                {/* Qualquer rota desconhecida redireciona para a homepage */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
