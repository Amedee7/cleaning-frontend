export interface ArticleCategory {
  id: number;
  name: string;
  icon: string;
  color: string;
  order: number;
  is_active: boolean;
}

export interface Article {
  id?: number;
  category_id: number;
  category?: ArticleCategory;
  name: string;
  reference?: string;
  unit: string;
  price_cleaning: number;
  price_ironing: number;
  price_dry_cleaning: number;
  price_full: number;
  processing_days: number;
  requires_marking: boolean;
  is_active: boolean;
}

export interface ClientGroup {
  id: number;
  name: string;
  default_discount: number;
}

export interface OrderItem {
  id?: number;
  article_id: number;
  article?: Article;
  service_type: 'lavage' | 'repassage' | 'nettoyage_sec' | 'service_complet';
  quantity: number;
  unit_price: number;
  discount_amount: number;
  total: number;
  sticker_code?: string;
  sticker_printed?: boolean;
  color?: string;
  brand?: string;
  condition_notes?: string;
  status?: string;
  service_label?: string;
}

export interface Payment {
  id: number;
  payment_number: string;
  amount: number;
  method: 'cash' | 'card' | 'mobile_money' | 'check' | 'transfer' | 'voucher';
  method_label?: string;
  timing: 'at_reception' | 'at_delivery';
  reference?: string;
  paid_at: string;
}

export interface Order {
  id: number;
  receipt_number: string;
  client_id?: number;
  client?: any;
  client_display_name?: string;
  client_phone?: string;
  anon_name?: string;
  anon_phone?: string;
  reference?: string;
  received_at: string;
  promised_at: string;
  ready_at?: string;
  delivered_at?: string;
  status: 'pending' | 'processing' | 'ready' | 'delivered' | 'cancelled';
  delivery_type: 'pickup' | 'delivery';
  subtotal: number;
  discount_amount: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  amount_paid: number;
  amount_due: number;
  payment_status: 'unpaid' | 'partial' | 'paid';
  payment_timing: 'at_reception' | 'at_delivery' | 'split';
  notes?: string;
  items?: OrderItem[];
  payments?: Payment[];
  total_items?: number;
  is_late?: boolean;
    pdf_path: string;
    deposit_pdf_url?: string;
    receipt_pdf_url: string;

}

export interface PressingDashboard {
  orders_today: number;
  items_today: number;
  revenue_today: number;
  pending_orders: number;
  processing_orders: number;
  ready_orders: number;
  late_orders: number;
  revenue_cash: number;
  revenue_card: number;
  revenue_mobile: number;
  ready_list: Order[];
  late_list: Order[];
}

export interface DailyReport {
  id: number;
  report_date: string;
  orders_received: number;
  orders_delivered: number;
  total_revenue: number;
  revenue_cash: number;
  revenue_card: number;
  revenue_mobile: number;
  total_discounts: number;
  total_tax: number;
  is_closed: boolean;
  closed_at?: string;
    revenue_other: number;
}

export interface PressingSettings {
  shop_name: string;
  shop_address?: string;
  shop_phone?: string;
  default_tax_rate: number;
  default_processing_days: number;
  currency: string;
  currency_symbol: string;
  receipt_footer?: string;
}


export interface Client {
    id: number;
    company_name?: string;
    contact_first_name?: string;
    contact_last_name?: string;
    phone?: string;
    mobile?: string;
    email?: string;
    type: 'individual' | 'company';
    status: 'active' | 'inactive';
    client_group_id: string;
}
