import { supabase } from "../lib/supabase";
import type { SimulatorConfig } from "../types";

export const simulatorApi = {
  configs: async () => {
    const { data } = await supabase.from("simulator_configs").select("*").order("wood_type");
    return { data: (data ?? []) as SimulatorConfig[] };
  },

  calculate: async (payload: { wood_type: string; quantity: number; distance_km: number; include_transport: boolean }) => {
    const { data: configs } = await supabase.from("simulator_configs").select("*").eq("wood_type", payload.wood_type).single();
    if (!configs) throw new Error("Tipo de madeira não encontrado");
    const wood_cost = Number(configs.price_per_unit) * payload.quantity;
    let transport_cost = 0;
    if (payload.include_transport && payload.distance_km > 0) {
      transport_cost = Math.max(Number(configs.min_transport_cost), payload.distance_km * Number(configs.transport_cost_per_km));
    }
    return { data: { wood_cost, transport_cost, total: wood_cost + transport_cost } };
  },
};
