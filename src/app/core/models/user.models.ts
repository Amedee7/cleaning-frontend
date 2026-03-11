// ─── models/user.models.ts ────────────────────────────────────────────────────

export interface Permission {
  key: string;
  label: string;
  group: string;
  description?: string;
}

export interface Role {
  id: number;
  name: string;
  slug: 'super_admin' | 'manager' | 'cashier' | 'operator';
  description?: string;
  color?: string;
  users_count?: number;
  permissions?: { permission_key: string }[];
}

export interface UserPermissionOverride {
  permission_key: string;
  granted: boolean;
}

export interface AppUser {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    role_id: number;
    role?: Role;
    status: 'active' | 'inactive';
    last_login_at?: string;
}

export interface UserPermissionsDetail {
  all_permissions:  Record<string, Permission[]>;
  role_permissions: string[];
  user_overrides:   Record<string, UserPermissionOverride>;
  effective:        string[];
}

// ─── Constantes rôles ─────────────────────────────────────────────────────────
export const ROLE_COLORS: Record<string, string> = {
    super_admin: '#ff4f6a',
    admin:       '#ff4f6a',
    manager:     '#b388ff',
    cashier:     '#4fffb0',
    operator:    '#00cfff',
    staff:       '#ffd54f',
    client:      '#5a5f72',
};

export const ROLE_LABELS: Record<string, string> = {
    super_admin: 'Super Admin',
    admin:       'Administrateur',
    manager:     'Gérant',
    cashier:     'Caissier',
    operator:    'Opérateur atelier',
    staff:       'Agent',
    client:      'Client',
};
