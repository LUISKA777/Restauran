export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered';

export interface Order {
  id: string;
  table_id: string | null;
  customer_name: string;
  status: OrderStatus;
  created_at: string;
  is_takeaway: boolean;
  people_count: number;
  restaurant_tables?: { table_number: number };
  order_items?: any[];
}
