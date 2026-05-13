import { supabase } from "../lib/supabase";
import { Order, TimeSlot } from "../types";

export const ordersApi = {
  slots: async (from_date: string, to_date: string, slot_type = "delivery") => {
    const { data } = await supabase
      .from("schedule_slots")
      .select("*")
      .eq("slot_type", slot_type)
      .gte("slot_date", from_date)
      .lte("slot_date", to_date)
      .order("slot_date")
      .order("start_time");
    return { data: (data ?? []).map((s) => ({ ...s, is_available: s.booked_count < s.max_orders })) as TimeSlot[] };
  },

  calculateDeliveryCost: async (postal_code: string, order_subtotal: number) => {
    // compara só os primeiros 4 dígitos do código postal para cobrir toda a localidade
    const prefix = postal_code.replace("-", "").slice(0, 4);
    const { data: zones } = await supabase.from("delivery_zones").select("*");
    if (!zones) return { data: { zone: null, delivery_cost: 5.0, free_delivery_threshold: null } };
    const zone = zones.find((z: any) =>
      z.postal_codes.split(",").map((p: string) => p.trim()).some((p: string) => p.slice(0, 4) === prefix)
    );
    if (!zone) return { data: { zone: null, delivery_cost: 5.0, free_delivery_threshold: null } };
    const cost = zone.free_delivery_threshold && order_subtotal >= Number(zone.free_delivery_threshold) ? 0 : Number(zone.delivery_cost);
    return { data: { zone: zone.name, delivery_cost: cost, free_delivery_threshold: zone.free_delivery_threshold } };
  },

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

    // preços sempre do servidor para evitar manipulação no cliente
    const productIds = payload.items.map((i) => i.product_id);
    const { data: products } = await supabase.from("products").select("id, price_per_unit").in("id", productIds);
    if (!products) throw new Error("Produtos não encontrados");

    const priceMap: Record<string, number> = Object.fromEntries(products.map((p: any) => [p.id, Number(p.price_per_unit)]));
    const subtotal = payload.items.reduce((sum, i) => sum + (priceMap[i.product_id] ?? 0) * i.quantity, 0);

    let deliveryCost = 0;
    if (payload.fulfillment_type === "delivery" && payload.address_id) {
      const { data: addr } = await supabase.from("addresses").select("postal_code").eq("id", payload.address_id).single();
      if (addr) {
        const result = await ordersApi.calculateDeliveryCost(addr.postal_code, subtotal);
        deliveryCost = result.data.delivery_cost ?? 0;
      }
    }

    const { data: order, error } = await supabase.from("orders").insert({
      user_id: session.user.id,
      address_id: payload.address_id ?? null,
      time_slot_id: payload.time_slot_id ?? null,
      fulfillment_type: payload.fulfillment_type,
      payment_method: payload.payment_method,
      subtotal,
      delivery_cost: deliveryCost,
      total: subtotal + deliveryCost,
      notes: payload.notes ?? null,
    }).select().single();

    if (error || !order) throw new Error(error?.message ?? "Erro ao criar encomenda");

    await supabase.from("order_items").insert(
      payload.items.map((i) => ({
        order_id: order.id,
        product_id: i.product_id,
        quantity: i.quantity,
        unit_price: priceMap[i.product_id],
        total_price: priceMap[i.product_id] * i.quantity,
      }))
    );

    if (payload.time_slot_id) {
      const { data: slot } = await supabase.from("schedule_slots").select("booked_count").eq("id", payload.time_slot_id).single();
      if (slot) {
        await supabase.from("schedule_slots").update({ booked_count: slot.booked_count + 1 }).eq("id", payload.time_slot_id);
      }
    }

    return { data: order as Order };
  },

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

  myOrder: async (id: string) => {
    const { data } = await supabase
      .from("orders")
      .select("*, address:addresses(*), items:order_items(*, product:products(*)), status_history:order_status_history(*)")
      .eq("id", id)
      .single();
    return { data: data as Order };
  },
};
