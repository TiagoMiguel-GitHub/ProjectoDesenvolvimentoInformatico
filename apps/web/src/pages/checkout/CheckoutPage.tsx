// Página de checkout — resume a encomenda e recolhe morada, horário, pagamento e notas.
// Redireciona para /login se o utilizador não estiver autenticado, e para /loja se o carrinho estiver vazio.
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CreditCard, MapPin, Clock, Truck, AlertCircle } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { authApi } from "../../api/auth";
import { ordersApi } from "../../api/orders";
import type { Address, TimeSlot } from "../../types";

// Nomes dos meses e dias para formatar as datas dos horários em português
const MONTHS_PT = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
const DAYS_PT = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];

// Devolve a data no formato "YYYY-MM-DD" com base no fuso horário local (não UTC)
function localDateStr(date: Date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
}

// Determina se um horário já não pode ser selecionado (exige 2h de antecedência no dia de hoje)
function isSlotExpired(slot: TimeSlot): boolean {
  const now = new Date();
  const today = localDateStr(now);
  if (slot.slot_date < today) return true;
  if (slot.slot_date > today) return false;
  const [h, m] = slot.start_time.split(":").map(Number);
  return h * 60 + m <= now.getHours() * 60 + now.getMinutes() + 120;
}

// Formata uma data "YYYY-MM-DD" em texto legível: "Hoje · 15 Jun", "Amanhã · 16 Jun", "Seg · 17 Jun"
function formatSlotDate(dateStr: string): string {
  const today = localDateStr();
  const t2 = new Date(); t2.setDate(t2.getDate()+1);
  const tomorrow = localDateStr(t2);
  const [y, mo, d] = dateStr.split("-").map(Number);
  const label = `${d} ${MONTHS_PT[mo-1]}`;
  if (dateStr === today) return `Hoje · ${label}`;
  if (dateStr === tomorrow) return `Amanhã · ${label}`;
  return `${DAYS_PT[new Date(y,mo-1,d).getDay()]} · ${label}`;
}

const PAYMENT_OPTIONS = [
  { key: "cash_on_delivery", label: "💵 Dinheiro" },
  { key: "mbway", label: "📱 MB Way" },
  { key: "multibanco", label: "🏧 Multibanco" },
];

export default function CheckoutPage() {
  const { items, total, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [fulfillment, setFulfillment] = useState<"delivery"|"pickup">("delivery");
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("cash_on_delivery");
  const [notes, setNotes] = useState("");
  const [deliveryCost, setDeliveryCost] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Guarda de acesso: sem sessão vai para login; carrinho vazio vai para a loja
  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    if (items.length === 0) { navigate("/loja"); return; }
    authApi.listAddresses().then(({ data }) => {
      setAddresses(data);
      // Seleciona a morada padrão ou a primeira da lista
      const def = data.find((a: Address) => a.is_default) ?? data[0] ?? null;
      setSelectedAddress(def);
    });
  }, [user, items]);

  // Recarrega os horários e limpa a seleção ao mudar o tipo de entrega
  useEffect(() => {
    setSelectedSlot(null);
    ordersApi.slots(fulfillment).then(({ data }) => setSlots(data));
  }, [fulfillment]);

  // Calcula o custo de entrega quando a morada ou o subtotal muda
  useEffect(() => {
    if (fulfillment === "delivery" && selectedAddress) {
      ordersApi.calculateDeliveryCost(selectedAddress.postal_code, total).then(({ delivery_cost }) => setDeliveryCost(delivery_cost));
    } else setDeliveryCost(0);
  }, [fulfillment, selectedAddress, total]);

  // Filtra horários expirados e agrupa por data para exibição em grelha
  const availableSlots = slots.filter((s) => s.is_available && !isSlotExpired(s));
  const slotsByDate = availableSlots.reduce<Record<string, TimeSlot[]>>((acc, s) => {
    (acc[s.slot_date] ??= []).push(s); return acc;
  }, {});
  const sortedDates = Object.keys(slotsByDate).sort();

  // Valida os campos, cria a encomenda via RPC e navega para o detalhe
  async function placeOrder() {
    if (fulfillment === "delivery" && !selectedAddress) { setError("Selecione uma morada de entrega"); return; }
    if (!selectedSlot) { setError("Selecione um horário"); return; }
    // Verificação final — o slot pode ter expirado enquanto o utilizador preenchia o formulário
    if (isSlotExpired(selectedSlot)) { setSelectedSlot(null); setError("O horário selecionado expirou. Escolha outro."); return; }
    setError(""); setLoading(true);
    try {
      const { data: order } = await ordersApi.create({
        address_id: fulfillment === "delivery" ? selectedAddress?.id : undefined,
        time_slot_id: selectedSlot.id,
        fulfillment_type: fulfillment,
        payment_method: paymentMethod,
        items: items.map((i) => ({ product_id: i.product.id, quantity: i.quantity })),
        notes: notes || undefined,
      });
      clear(); // esvazia o carrinho após encomenda criada com sucesso
      navigate(`/conta/encomendas/${order.id}`);
    } catch (e: any) {
      setError(e?.message || "Não foi possível criar a encomenda");
    } finally { setLoading(false); }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-10">Finalizar encomenda</h1>

      {/* Layout em duas colunas: formulário à esquerda, resumo colado no topo à direita */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Seleção do tipo de entrega */}
          <div className="card p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Truck className="w-5 h-5 text-primary-500" /> Tipo de entrega</h2>
            <div className="grid grid-cols-2 gap-3">
              {([["delivery","🚚 Entrega ao domicílio"],["pickup","🏪 Levantamento em loja"]] as const).map(([val, label]) => (
                <button key={val} onClick={() => setFulfillment(val)} className={`p-4 rounded-xl border-2 font-medium text-sm transition-all ${fulfillment === val ? "border-primary-500 bg-primary-50 text-primary-700" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Seleção de morada — apenas visível para entrega ao domicílio */}
          {fulfillment === "delivery" && (
            <div className="card p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><MapPin className="w-5 h-5 text-primary-500" /> Morada de entrega</h2>
              {addresses.length === 0 ? (
                <button onClick={() => navigate("/conta/moradas")} className="btn-outline text-sm">+ Adicionar morada</button>
              ) : (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <button key={addr.id} onClick={() => setSelectedAddress(addr)} className={`w-full text-left p-4 rounded-xl border-2 transition-all ${selectedAddress?.id === addr.id ? "border-primary-500 bg-primary-50" : "border-gray-200 hover:border-gray-300"}`}>
                      <p className="font-semibold text-gray-900">{addr.label || addr.street}</p>
                      <p className="text-sm text-gray-500 mt-0.5">{addr.street}, {addr.city} {addr.postal_code}</p>
                    </button>
                  ))}
                </div>
              )}
              {deliveryCost === 0 && selectedAddress && <p className="text-primary-500 font-semibold text-sm mt-3">🎉 Entrega gratuita!</p>}
              {deliveryCost > 0 && <p className="text-orange-500 font-semibold text-sm mt-3">Custo de entrega: €{deliveryCost.toFixed(2)}</p>}
            </div>
          )}

          {/* Horários disponíveis */}
          <div className="card p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Clock className="w-5 h-5 text-primary-500" /> {fulfillment === "pickup" ? "Dia de levantamento" : "Horário"}</h2>
            {sortedDates.length === 0 ? (
              <p className="text-gray-400 text-sm">Sem horários disponíveis esta semana.</p>
            ) : fulfillment === "pickup" ? (
              <div className="space-y-2">
                {sortedDates.map((date) => {
                  const slot = slotsByDate[date][0];
                  return (
                    <button key={date} onClick={() => setSelectedSlot(slot)} className={`w-full text-left p-4 rounded-xl border-2 transition-all ${selectedSlot?.slot_date === date ? "border-primary-500 bg-primary-50 text-primary-700" : "border-gray-200 text-gray-600 hover:border-primary-300"}`}>
                      <p className="font-semibold">{formatSlotDate(date)}</p>
                      <p className="text-sm mt-0.5 opacity-75">🏪 Aberto das {slot.start_time.slice(0,5)} às {slot.end_time.slice(0,5)}</p>
                    </button>
                  );
                })}
              </div>
            ) : (
              sortedDates.map((date) => (
                <div key={date} className="mb-5">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">{formatSlotDate(date)}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {slotsByDate[date].map((slot) => (
                      <button key={slot.id} onClick={() => setSelectedSlot(slot)} className={`p-3 rounded-xl border-2 text-sm font-semibold transition-all ${selectedSlot?.id === slot.id ? "border-primary-500 bg-primary-50 text-primary-700" : "border-gray-200 text-gray-600 hover:border-primary-300"}`}>
                        {slot.start_time.slice(0,5)} – {slot.end_time.slice(0,5)}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Método de pagamento */}
          <div className="card p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><CreditCard className="w-5 h-5 text-primary-500" /> Método de pagamento</h2>
            <div className="space-y-2">
              {PAYMENT_OPTIONS.map((opt) => (
                <button key={opt.key} onClick={() => setPaymentMethod(opt.key)} className={`w-full text-left p-4 rounded-xl border-2 font-medium transition-all ${paymentMethod === opt.key ? "border-primary-500 bg-primary-50 text-primary-700" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Campo de notas livre para instruções de entrega */}
          <div className="card p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Notas (opcional)</h2>
            <textarea className="input h-24 resize-none" placeholder="Ex: deixar no portão..." value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>

        {/* Painel de resumo — sticky para ficar visível enquanto o utilizador preenche o formulário */}
        <div>
          <div className="card p-6 sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Resumo da encomenda</h2>
            <div className="space-y-3 mb-6">
              {items.map((item) => (
                <div key={item.product.id} className="flex justify-between text-sm">
                  <span className="text-gray-500 truncate mr-2">{item.product.name} ×{item.quantity}</span>
                  <span className="font-medium">€{(Number(item.product.price_per_unit)*item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-4 space-y-2 mb-6">
              <div className="flex justify-between text-sm"><span className="text-gray-500">Subtotal</span><span>€{total.toFixed(2)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Entrega</span><span>{deliveryCost === 0 ? "Gratuita" : `€${deliveryCost.toFixed(2)}`}</span></div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-100">
                <span>Total</span><span className="text-primary-500">€{(total+deliveryCost).toFixed(2)}</span>
              </div>
            </div>
            {error && (
              <div className="flex items-start gap-2 text-red-500 bg-red-50 px-4 py-3 rounded-xl text-sm mb-4">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" /> {error}
              </div>
            )}
            <button onClick={placeOrder} disabled={loading} className="btn-primary w-full py-4 text-base flex items-center justify-center gap-2">
              {loading ? "A processar..." : "Confirmar encomenda"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
