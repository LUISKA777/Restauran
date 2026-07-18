export interface Restaurant {
  id: string;
  name: string;
  general_password: string;
  is_active: boolean;
  created_at: string;
  settings?: any;
}

export interface Superadmin {
  id: string;
  email: string;
  name: string;
  created_at: string;
}
