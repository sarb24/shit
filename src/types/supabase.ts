export type Database = {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string;
          name: string;
          admin_email: string;
          created_at: string;
        };
        Insert: {
          name: string;
          admin_email: string;
        };
        Update: {
          name?: string;
          admin_email?: string;
        };
      };
      company_users: {
        Row: {
          id: string;
          company_id: string;
          user_id: string;
          role: 'admin' | 'user';
          created_at: string;
        };
        Insert: {
          company_id: string;
          user_id: string;
          role: 'admin' | 'user';
        };
        Update: {
          company_id?: string;
          user_id?: string;
          role?: 'admin' | 'user';
        };
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
        };
        Update: {
          email?: string;
        };
      };
      user_permissions: {
        Row: {
          user_id: string;
          user_email: string;
          company_id: string;
        };
        Insert: never;
        Update: never;
      };
    };
    Views: {
      user_permissions: {
        Row: {
          user_id: string;
          user_email: string;
          company_id: string;
        };
      };
    };
  };
}; 