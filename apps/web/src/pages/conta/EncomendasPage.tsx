import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, ChevronRight } from "lucide-react";
import { ordersApi } from "../../api/orders";
import type { Order } from "../../types";

const STATUS: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: "Pendente", color: "text-amber-600", bg: "bg-amber-50" },
  confirmed: { label: "Confirmada", color: "text-blue-600", bg: "bg-blue-50" },
  preparing: { label: "Em preparação", color: "text-purple-600", bg: "bg-purple-50" },
  out_for_delivery: { label: "Em entrega", color: "text-orange-600", bg: "bg-orange-50" },
  completed: { label: "Concluída", color: "text-green-600", bg: "bg-green-50" },
  cancelled: { label: "Cancelada", color: "text-red-600", bg: "bg-red-50" },
};

export default function EncomendasPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersApi.myOrders().then(({ data }) => { setOrders(data); setLoading(false); });
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>;

  if (orders.length === 0) return (
    <div className="text-center py-16">
      <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4"><Package className="w-10 h-10 text-primary-300" /></div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">Ainda não tem encomendas</h3>
      <p className="text-gray-400 mb-6">Explore a nossa loja e faça a sua primeira encomenda.</p>
      <Link to="/loja" className="btn-primary">Ver produtos</Link>
    </div>
  );

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const st = STATUS[order.status] ?? { label: order.status, color: "text-gray-600", bg: "bg-gray-50" };
        return (
          <Link key={order.id} to={`/conta/encomendas/${order.id}`} className="card p-6 flex items-center gap-4 hover:shadow-md transition-all group">
            <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <Package className="w-6 h-6 text-primary-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <span className="font-bold text-gray-900">#{order.id.slice(0,8).toUpperCase()}</span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${st.color} ${st.bg}`}>{st.label}</span>
              </div>
              <p className="text-sm text-gray-400">{new Date(order.created_at).toLocaleDateString("pt-PT")} · {order.items?.length ?? 0} produto(s)</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-900 text-lg">€{Number(order.total).toFixed(2)}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary-500 transition-colors" />
          </Link>
        );
      })}
    </div>
  );
}
