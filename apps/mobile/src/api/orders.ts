import { api } from "./client";
import { Order, TimeSlot } from "../types";

export const ordersApi = {
  create: (data: {
    address_id?: string;
    time_slot_id?: string;
    fulfillment_type: string;
    payment_method: string;
    items: { product_id: string; quantity: number }[];
    notes?: string;
  }) => api.post<Order>("/orders", data),

  myOrders: () => api.get<Order[]>("/orders/my"),

  myOrder: (id: string) => api.get<Order>(`/orders/my/${id}`),

  slots: (from_date: string, to_date: string, slot_type = "delivery") =>
    api.get<TimeSlot[]>("/schedule/slots", { params: { from_date, to_date, slot_type } }),

  calculateDeliveryCost: (postal_code: string, order_subtotal: number) =>
    api.post<{ zone: string | null; delivery_cost: number | null; free_delivery_threshold: number | null }>(
      "/delivery-zones/calculate-cost",
      { postal_code, order_subtotal }
    ),
};
