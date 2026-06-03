export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'paid' | 'cancelled';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  notes?: string;
  delivered: boolean;
  products?: {
    id: string;
    name: string;
    price: number;
    description: string;
    image_url: string;
  };
}

export interface Order {
  id: string;
  table_id: string | null;
  customer_name: string;
  status: OrderStatus;
  created_at: string;
  is_takeaway: boolean;
  people_count: number;
  notes?: string;
  total_price: number;
  is_paid: boolean;
  restaurant_tables?: { table_number: number };
  order_items?: OrderItem[];
}
