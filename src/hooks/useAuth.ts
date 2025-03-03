import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { AuthEvent, UserSession } from '../lib/supabaseClient';

interface AuthUser {
  id: string;
  email?: string;
  user_metadata?: Record<string, any>;
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          setUser(session?.user as AuthUser ?? null);
        }
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: AuthEvent, session: UserSession) => {
        if (mounted) {
          setUser(session?.user as AuthUser ?? null);
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
}; 