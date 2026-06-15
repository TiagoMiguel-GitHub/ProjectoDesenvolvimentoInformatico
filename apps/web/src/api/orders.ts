// Módulo de API para operações de encomendas no website.
// Espelha a lógica da app mobile mas simplifica alguns parâmetros
// (ex: `slots` calcula o intervalo de datas internamente em vez de receber from/to).
import { supabase } from "../lib/supabase";
import type { Order, TimeSlot } from "../types";

// Devolve a data atual no formato "YYYY-MM-DD" usando o fuso horário local
function localDateStr(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export const ordersApi = {
  // Busca os horários disponíveis para os próximos 7 dias.
  // O campo `is_available` é calculado no cliente comparando booked_count com max_orders.
  slots: async (slot_type = "delivery") => {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    const { data } = await supabase
      .from("schedule_slots")
      .select("*")
      .eq("slot_type", slot_type)
      .gte("slot_date", localDateStr(today))
      .lte("slot_date", localDateStr(nextWeek))
      .order("slot_date")
      .order("start_time");
    return { data: (data ?? []).map((s) => ({ ...s, is_available: s.booked_count < s.max_orders })) as TimeSlot[] };
  },

  // Calcula o custo de entrega com base no código postal do cliente e no subtotal da encomenda.
  // Compara os 4 primeiros dígitos do código postal com as zonas de entrega configuradas.
  // Se o subtotal atingir o limiar da zona, a entrega é gratuita.
  calculateDeliveryCost: async (postal_code: string, subtotal: number) => {
    const prefix = postal_code.replace("-", "").slice(0, 4);
    const { data: zones } = await supabase.from("delivery_zones").select("*");
    if (!zones) return { delivery_cost: 5.0 };
    const zone = zones.find((z: any) =>
      z.postal_codes.split(",").map((p: string) => p.trim()).some((p: string) => p.slice(0, 4) === prefix)
    );
    if (!zone) return { delivery_cost: 5.0 }; // zona desconhecida: custo padrão de 5€
    const cost = zone.free_delivery_threshold && subtotal >= Number(zone.free_delivery_threshold) ? 0 : Number(zone.delivery_cost);
    return { delivery_cost: cost };
  },

  // Cria uma encomenda usando a RPC `create_order` do Supabase.
  // A RPC é SECURITY DEFINER — executa como administrador para contornar o RLS
  // e garantir atomicidade: validação de stock, criação de registos e decremento de stock
  // num único bloco transacional, evitando condições de corrida com múltiplos utilizadores.
  create: async (payload: {
    address_id?: string;
    time_slot_id?: string;
    fulfillment_type: string;
    payment_method: string;
    items: { product_id: string; quantity: number }[];
    notes?: string;
  }) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Não autenticado");

    // Calcula o subtotal no cliente para determinar o custo de entrega antes de chamar a RPC
    const productIds = payload.items.map((i) => i.product_id);
    const { data: products } = await supabase.from("products").select("id, price_per_unit").in("id", productIds);
    if (!products) throw new Error("Produtos não encontrados");

    const priceMap: Record<string, number> = Object.fromEntries(products.map((p: any) => [p.id, Number(p.price_per_unit)]));
    const subtotal = payload.items.reduce((sum, i) => sum + (priceMap[i.product_id] ?? 0) * i.quantity, 0);

    let deliveryCost = 0;
    if (payload.fulfillment_type === "delivery" && payload.address_id) {
      const { data: addr } = await supabase.from("addresses").select("postal_code").eq("id", payload.address_id).single();
      if (addr) deliveryCost = (await ordersApi.calculateDeliveryCost(addr.postal_code, subtotal)).delivery_cost;
    }

    const { data: order, error } = await supabase.rpc("create_order", {
      p_user_id: session.user.id,
      p_address_id: payload.address_id ?? null,
      p_time_slot_id: payload.time_slot_id ?? null,
      p_fulfillment_type: payload.fulfillment_type,
      p_payment_method: payload.payment_method,
      p_delivery_cost: deliveryCost,
      p_notes: payload.notes ?? null,
      p_items: payload.items,
    });

    if (error) throw new Error(error.message);
    return { data: order as Order };
  },

  // Devolve todas as encomendas do utilizador com relações expandidas (morada, itens, produtos)
  myOrders: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return { data: [] as Order[] };
    const { data } = await supabase
      .from("orders")
      .select("*, address:addresses(*), items:order_items(*, product:products(*))")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });
    return { data: (data ?? []) as Order[] };
  },

  // Devolve uma encomenda específica incluindo o histórico de estados
  myOrder: async (id: string) => {
    const { data } = await supabase
      .from("orders")
      .select("*, address:addresses(*), items:order_items(*, product:products(*)), status_history:order_status_history(*)")
      .eq("id", id)
      .single();
    return { data: data as Order };
  },
};
