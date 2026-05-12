export interface User {
  id: string;
  email: string;
  phone: string | null;
  full_name: string;
  role: "customer" | "admin";
  is_active: boolean;
  created_at: string;
  addresses: Address[];
}

export interface Address {
  id: string;
  label: string | null;
  street: string;
  city: string;
  postal_code: string;
  is_default: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  unit: string;
  price_per_unit: number;
  stock_quantity: number;
  min_order_quantity: number;
  image_url: string | null;
  season_start_month: number | null;
  season_end_month: number | null;
  is_active: boolean;
  category: Category;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface TimeSlot {
  id: string;
  slot_date: string;
  start_time: string;
  end_time: string;
  max_orders: number;
  booked_count: number;
  slot_type: string;
  is_available: boolean;
}

export interface OrderItem {
  id: string;
  product: Product;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface OrderStatusEntry {
  status: string;
  note: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  status: string;
  fulfillment_type: string;
  payment_method: string;
  payment_status: string;
  subtotal: number;
  delivery_cost: number;
  total: number;
  multibanco_entity: string | null;
  multibanco_reference: string | null;
  notes: string | null;
  created_at: string;
  address: Address | null;
  items: OrderItem[];
  status_history: OrderStatusEntry[];
}

export interface SimulatorConfig {
  id: string;
  wood_type: string;
  price_per_unit: number;
  unit: string;
  transport_cost_per_km: number;
  min_transport_cost: number;
  description: string | null;
}
