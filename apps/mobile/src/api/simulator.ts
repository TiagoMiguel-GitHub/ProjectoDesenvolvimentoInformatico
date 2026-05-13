import { supabase } from "../lib/supabase";

export const simulatorApi = {
  configs: () =>
    supabase.from("simulator_configs").select("*").order("wood_type"),

  calculate: async (data: { wood_type: string; quantity: number; distance_km?: number; include_transport?: boolean }) => {
    const { data: config } = await supabase
      .from("simulator_configs")
      .select("*")
      .eq("wood_type", data.wood_type)
      .single();
    if (!config) throw new Error("Tipo de madeira não encontrado");
    const woodCost = Number(config.price_per_unit) * data.quantity;
    const distanceKm = data.distance_km ?? 0;
    const transportCost = data.include_transport
      ? Math.max(Number(config.transport_cost_per_km) * distanceKm, Number(config.min_transport_cost))
      : 0;
    return {
      data: {
        wood_type: config.wood_type,
        quantity: data.quantity,
        unit: config.unit,
        price_per_unit: Number(config.price_per_unit),
        wood_cost: woodCost,
        transport_cost: transportCost,
        total: woodCost + transportCost,
      },
    };
  },
};
