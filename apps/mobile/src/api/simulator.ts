import { api } from "./client";
import { SimulatorConfig } from "../types";

export const simulatorApi = {
  configs: () => api.get<SimulatorConfig[]>("/simulator/configs"),

  calculate: (data: { wood_type: string; quantity: number; distance_km?: number; include_transport?: boolean }) =>
    api.post<{
      wood_type: string;
      quantity: number;
      unit: string;
      price_per_unit: number;
      wood_cost: number;
      transport_cost: number;
      total: number;
    }>("/simulator/calculate", data),
};
