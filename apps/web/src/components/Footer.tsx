import { Link } from "react-router-dom";
import { TreePine, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-primary-500 rounded-xl flex items-center justify-center">
                <TreePine className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Agro<span className="text-primary-400">Wood</span></span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              Fornecedores de madeiras e produtos florestais de qualidade. Entrega ao domicílio em todo o país.
            </p>
            <div className="mt-6 space-y-2">
              <div className="flex items-center gap-2 text-sm"><Mail className="w-4 h-4 text-primary-400" /> info@agrowood.pt</div>
              <div className="flex items-center gap-2 text-sm"><Phone className="w-4 h-4 text-primary-400" /> +351 234 000 000</div>
              <div className="flex items-center gap-2 text-sm"><MapPin className="w-4 h-4 text-primary-400" /> Coimbra, Portugal</div>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Loja</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/loja" className="hover:text-primary-400 transition-colors">Todos os produtos</Link></li>
              <li><Link to="/simulador" className="hover:text-primary-400 transition-colors">Simulador de orçamento</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Conta</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/login" className="hover:text-primary-400 transition-colors">Iniciar sessão</Link></li>
              <li><Link to="/registar" className="hover:text-primary-400 transition-colors">Criar conta</Link></li>
              <li><Link to="/conta/encomendas" className="hover:text-primary-400 transition-colors">As minhas encomendas</Link></li>
              <li><Link to="/conta/moradas" className="hover:text-primary-400 transition-colors">Moradas guardadas</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-sm text-gray-500 text-center">
          © {new Date().getFullYear()} AgroWood. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
