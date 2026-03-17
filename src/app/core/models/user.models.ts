export interface Permission {
    key:          string;
    label:        string;
    group:        string;
    description?: string;
}

export interface Role {
    id:          number;
    name:        string;   // 'super_admin' | 'admin' | 'manager' | 'cashier' | 'operator' | 'staff'
    label?:      string;   // Libellé affiché
    description?: string;
    color?:      string;
    users_count?: number;
    permissions?: { permission_key: string }[];
}

export interface AppUser {
    id:          number;
    first_name:  string;
    last_name:   string;
    email:       string;
    phone?:      string;
    avatar?:     string;
    role_id:     number;
    role?:       Role;
    status:      'active' | 'inactive' | 'suspended';
    last_login_at?: string;
}

export interface UserPermissionOverride {
    permission_key: string;
    granted:        boolean;
}

export interface UserPermissionsDetail {
    all_permissions:  Record<string, Permission[]>;
    role_permissions: string[];
    user_overrides:   Record<string, UserPermissionOverride>;
    effective:        string[];
}

// ─── Constantes rôles ─────────────────────────────────────────────────────────
// Clés = role.name (PAS slug)
export const ROLE_COLORS: Record<string, string> = {
    super_admin: '#ff4f6a',
    admin:       '#ff4f6a',
    manager:     '#b388ff',
    cashier:     '#4fffb0',
    operator:    '#00cfff',
    staff:       '#ffd54f',
};

export const ROLE_LABELS: Record<string, string> = {
    super_admin: 'Super Admin',
    admin:       'Admin',
    manager:     'Gérant',
    cashier:     'Caissier',
    operator:    'Opérateur',
    staff:       'Personnel',
};

// ─── Mapping permissions → descriptions ───────────────────────────────────────
export const PERMISSION_GROUPS: Record<string, { label: string; icon: string }> = {
    orders:   { label: 'Commandes',    icon: '🧾' },
    articles: { label: 'Articles',     icon: '👔' },
    clients:  { label: 'Clients',      icon: '👥' },
    reports:  { label: 'Rapports',     icon: '📈' },
    users:    { label: 'Utilisateurs', icon: '🔑' },
    settings: { label: 'Paramètres',   icon: '⚙️' },
};
