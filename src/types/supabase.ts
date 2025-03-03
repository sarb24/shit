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
      // Add other tables as needed
    };
  };
}; 