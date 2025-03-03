import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY!;

// Define and export auth event types
export type AuthEvent = 
  | 'INITIAL_SESSION'
  | 'SIGNED_IN'
  | 'SIGNED_OUT'
  | 'TOKEN_REFRESHED'
  | 'USER_UPDATED'
  | 'USER_DELETED'
  | 'PASSWORD_RECOVERY';

// Define and export session type
export type UserSession = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: {
    id: string;
    email?: string;
  };
} | null;

// Create and export a single instance
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'my-custom-storage-key'
  }
});

// Set up auth state listener
supabase.auth.onAuthStateChange((event: AuthEvent, session: UserSession) => {
  if (event === 'SIGNED_OUT') {
    localStorage.removeItem('company-auth-storage');
  }
});

// Export types
export type { AuthSession, AuthUser } from '@supabase/supabase-js'; 