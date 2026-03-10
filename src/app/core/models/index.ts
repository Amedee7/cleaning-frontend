// ─── Auth ────────────────────────────────────────────────────────────────────
export interface LoginPayload  { email: string; password: string; }
export interface AuthResponse  { token: string; user: AuthUser; }
export interface AuthUser {
  id: number; full_name: string; email: string;
  role: 'admin' | 'manager' | 'staff' | 'client'; avatar?: string;
}


// ─── Pagination ──────────────────────────────────────────────────────────────
export interface Paginated<T> {
  data: T[]; current_page: number; last_page: number;
  per_page: number; total: number;
}

// ─── Role ────────────────────────────────────────────────────────────────────
export interface Role { id: number; name: string; label: string; }

// ─── User ────────────────────────────────────────────────────────────────────
export interface User {
  id: number; role_id: number; role?: Role;
  first_name: string; last_name: string; full_name: string;
  email: string; phone?: string; avatar?: string;
  status: 'active' | 'inactive' | 'suspended';
  staff_profile?: StaffProfile;
  created_at: string;
}

// ─── StaffProfile ─────────────────────────────────────────────────────────────
export interface StaffProfile {
  id: number; user_id: number; employee_number?: string;
  hire_date: string; birth_date?: string; position?: string;
  hourly_rate?: number; weekly_hours: number;
  zone?: string; availability?: Record<string, any>;
}

// ─── Client ──────────────────────────────────────────────────────────────────
export interface Client {
  id: number; company_name?: string;
  contact_first_name: string; contact_last_name: string;
  contact_name?: string; display_name?: string;
  email: string; phone: string; mobile?: string;
  billing_address: string; city: string; postal_code: string;
  country: string; tax_number?: string;
  type: 'individual' | 'company';
  status: 'active' | 'inactive';
  notes?: string;
  properties_count?: number; contracts_count?: number;
  created_at: string;
}

// ─── Property ────────────────────────────────────────────────────────────────
export interface Property {
  id: number; client_id: number; client?: Client;
  name: string; address: string; city: string;
  postal_code: string; country: string;
  latitude?: number; longitude?: number;
  type: 'office'|'residential'|'industrial'|'retail'|'healthcare'|'school'|'other';
  area_sqm?: number; floors: number;
  access_instructions?: string; access_code?: string; key_location?: string;
  status: 'active' | 'inactive'; notes?: string;
  created_at: string;
}

// ─── Service ─────────────────────────────────────────────────────────────────
export interface Service {
  id: number; name: string; description?: string;
  category: string; base_price: number;
  pricing_unit: 'fixed'|'per_sqm'|'per_hour';
  estimated_duration?: number; requires_equipment: boolean; is_active: boolean;
}

// ─── Contract ────────────────────────────────────────────────────────────────
export interface Contract {
  id: number; client_id: number; client?: Client;
  contract_number: string; title: string;
  start_date: string; end_date?: string;
  frequency: string; frequency_days?: string[];
  preferred_time_start?: string; preferred_time_end?: string;
  total_amount: number; billing_cycle: string;
  status: 'draft'|'active'|'suspended'|'terminated'|'expired';
  properties?: Property[]; services?: Service[];
  created_at: string;
}

// ─── Schedule ────────────────────────────────────────────────────────────────
export interface Schedule {
  id: number; contract_id?: number; property_id: number; service_id: number;
  reference: string;
  property?: Property; service?: Service; staff?: User[]; contract?: Contract;
  scheduled_start: string; scheduled_end: string;
  actual_start?: string; actual_end?: string;
  status: 'pending'|'confirmed'|'in_progress'|'completed'|'cancelled'|'rescheduled';
  priority: 'low'|'normal'|'high'|'urgent';
  instructions?: string; client_notes?: string;
  is_recurring: boolean; cancelled_reason?: string;
  tasks?: Task[]; report?: Report;
  duration_minutes?: number;
  created_at: string;
}

// ─── Task ─────────────────────────────────────────────────────────────────────
export interface Task {
  id: number; schedule_id: number; title: string;
  description?: string; order: number;
  is_mandatory: boolean; requires_photo: boolean;
  status: 'pending'|'in_progress'|'completed'|'skipped';
  completed_at?: string; completion_notes?: string;
}

// ─── Report ──────────────────────────────────────────────────────────────────
export interface Report {
  id: number; schedule_id: number; submitted_by: number;
  schedule?: Schedule; submitted_by_user?: User;
  summary: string; issues_found?: string; client_feedback?: string;
  quality_score?: number; client_signed: boolean;
  client_signed_name?: string; signed_at?: string;
  client_notified: boolean; submitted_at: string;
  photos?: ReportPhoto[];
}

export interface ReportPhoto {
  id: number; report_id: number; path: string;
  type: 'before'|'after'|'issue'|'other'; caption?: string;
}

// ─── Invoice ──────────────────────────────────────────────────────────────────
export interface Invoice {
  id: number; client_id: number; contract_id?: number;
  client?: Client; invoice_number: string;
  issued_at: string; due_date: string; paid_at?: string;
  subtotal: number; tax_rate: number; tax_amount: number;
  discount_amount: number; total: number;
  status: 'draft'|'sent'|'paid'|'overdue'|'cancelled';
  payment_method?: string; notes?: string;
  lines?: InvoiceLine[]; is_overdue?: boolean;
  created_at: string;
}

export interface InvoiceLine {
  id: number; invoice_id: number; schedule_id?: number;
  service_id?: number; description: string;
  quantity: number; unit_price: number; total: number; order: number;
}

// ─── Equipment / Supply ───────────────────────────────────────────────────────
export interface Equipment {
  id: number; name: string; serial_number?: string;
  type: string; brand?: string; model?: string;
  purchase_date?: string; purchase_price?: number;
  last_maintenance?: string; next_maintenance?: string;
  status: 'available'|'in_use'|'maintenance'|'retired';
  is_maintenance_due?: boolean;
}

export interface Supply {
  id: number; name: string; reference?: string;
  category: string; unit: string; unit_price?: number;
  stock_quantity: number; minimum_stock: number;
  supplier?: string; is_chemical: boolean; is_low_stock?: boolean;
}

// ─── Incident ────────────────────────────────────────────────────────────────
export interface Incident {
  id: number; schedule_id?: number; property_id?: number;
  reported_by: number; title: string; description: string;
  severity: 'low'|'medium'|'high'|'critical';
  type: string; status: 'open'|'in_review'|'resolved'|'closed';
  resolution?: string; resolved_by?: number; resolved_at?: string;
  property?: Property; created_at: string;
}

// ─── Dashboard ───────────────────────────────────────────────────────────────
export interface DashboardStats {
  kpis: {
    interventions_today: number; interventions_pending: number;
    interventions_month: number; clients_active: number;
    staff_active: number; invoices_overdue: number;
    revenue_month: number; incidents_open: number;
  };
  schedules_by_status: { status: string; total: number }[];
  upcoming_schedules: Schedule[];
  monthly_revenue: { year: number; month: number; total: number }[];
  overdue_invoices: Invoice[];
}
