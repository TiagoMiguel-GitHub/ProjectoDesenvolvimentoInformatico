import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Package, MapPin, Clock, CreditCard } from "lucide-react";
import { ordersApi } from "../../api/orders";
import type { Order } from "../../types";

const STATUS: Record<string, { label: string; color: string; bg: string; step: number }> = {
  pending: { label: "Pendente", color: "text-amber-600", bg: "bg-amber-100", step: 0 },
  confirmed: { label: "Confirmada", color: "text-blue-600", bg: "bg-blue-100", step: 1 },
  preparing: { label: "Em preparação", color: "text-purple-600", bg: "bg-purple-100", step: 2 },
  out_for_delivery: { label: "Em entrega", color: "text-orange-600", bg: "bg-orange-100", step: 3 },
  completed: { label: "Concluída", color: "text-green-600", bg: "bg-green-100", step: 4 },
  cancelled: { label: "Cancelada", color: "text-red-600", bg: "bg-red-100", step: -1 },
};

const STEPS = ["Pendente", "Confirmada", "Em preparação", "Em entrega", "Concluída"];

export default function EncomendaDetalhe() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) ordersApi.myOrder(id).then(({ data }) => setOrder(data));
  }, [id]);

  if (!order) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>;

  const st = STATUS[order.status] ?? { label: order.status, color: "text-gray-600", bg: "bg-gray-100", step: 0 };

  return (
    <div className="space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-primary-500 transition-colors">
        <ArrowLeft className="w-5 h-5" /> Voltar às encomendas
      </button>

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">#{order.id.slice(0,8).toUpperCase()}</h2>
        <span className={`px-4 py-2 rounded-xl text-sm font-bold ${st.color} ${st.bg}`}>{st.label}</span>
      </div>

      {/* Progress */}
      {order.status !== "cancelled" && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-2">
            {STEPS.map((step, i) => (
              <div key={step} className="flex flex-col items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mb-2 transition-colors ${i <= st.step ? "bg-primary-500 text-white" : "bg-gray-100 text-gray-400"}`}>
                  {i < st.step ? "✓" : i + 1}
                </div>
                <span className={`text-xs text-center hidden sm:block ${i <= st.step ? "text-primary-500 font-semibold" : "text-gray-400"}`}>{step}</span>
                {i < STEPS.length - 1 && (
                  <div className={`absolute h-0.5 w-full mt-4 ${i < st.step ? "bg-primary-500" : "bg-gray-100"}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Items */}
        <div className="card p-6">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Package className="w-5 h-5 text-primary-500" /> Produtos</h3>
          <div className="space-y-3">
            {order.items?.map((item) => (
              <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="font-medium text-gray-900">{item.product?.name}</p>
                  <p className="text-sm text-gray-400">×{item.quantity} · €{Number(item.unit_price).toFixed(2)} cada</p>
                </div>
                <span className="font-bold text-gray-900">€{Number(item.total_price).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 mt-4 pt-4 space-y-2">
            <div className="flex justify-between text-sm text-gray-500"><span>Subtotal</span><span>€{Number(order.subtotal).toFixed(2)}</span></div>
            <div className="flex justify-between text-sm text-gray-500"><span>Entrega</span><span>€{Number(order.delivery_cost).toFixed(2)}</span></div>
            <div className="flex justify-between font-bold text-lg"><span>Total</span><span className="text-primary-500">€{Number(order.total).toFixed(2)}</span></div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Address */}
          {order.address && (
            <div className="card p-6">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><MapPin className="w-5 h-5 text-primary-500" /> Morada</h3>
              <p className="text-gray-700">{order.address.street}</p>
              <p className="text-gray-500 text-sm">{order.address.postal_code} {order.address.city}</p>
            </div>
          )}

          {/* Payment */}
          <div className="card p-6">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><CreditCard className="w-5 h-5 text-primary-500" /> Pagamento</h3>
            <p className="text-gray-700 capitalize">{order.payment_method.replace(/_/g," ")}</p>
            <p className="text-sm text-gray-400 mt-1">{order.payment_status === "paid" ? "✅ Pago" : "⏳ Pendente"}</p>
          </div>

          {/* Date */}
          <div className="card p-6">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><Clock className="w-5 h-5 text-primary-500" /> Data</h3>
            <p className="text-gray-700">{new Date(order.created_at).toLocaleString("pt-PT")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
