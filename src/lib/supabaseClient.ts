import { createClient } from '@supabase/supabase-js';

// Log environment check
console.log('Environment check:', {
  nodeEnv: process.env.NODE_ENV,
  hasSupabaseUrl: !!process.env.REACT_APP_SUPABASE_URL,
  hasSupabaseKey: !!process.env.REACT_APP_SUPABASE_ANON_KEY,
  vercelEnv: process.env.VERCEL_ENV,
  isVercelDeployment: !!process.env.VERCEL,
  timestamp: new Date().toISOString()
});

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase Configuration Error:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    urlLength: supabaseUrl?.length,
    keyLength: supabaseAnonKey?.length,
    vercelEnv: process.env.VERCEL_ENV,
    timestamp: new Date().toISOString()
  });
  throw new Error('Missing Supabase environment variables');
}

console.log('Initializing Supabase client with:', {
  url: supabaseUrl.substring(0, 8) + '...',
  hasKey: !!supabaseAnonKey,
  env: process.env.NODE_ENV,
  vercelEnv: process.env.VERCEL_ENV,
  urlLength: supabaseUrl.length,
  keyLength: supabaseAnonKey.length,
  timestamp: new Date().toISOString()
});

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

// Create and export a single instance with enhanced error logging
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'my-custom-storage-key'
  },
  global: {
    headers: {
      'x-vercel-deployment': process.env.VERCEL_ENV || 'local'
    }
  }
});

// Enhance verifyDatabase function with more detailed error tracking
const verifyDatabase = async () => {
  const requestId = Math.random().toString(36).substring(7);
  console.log('Starting database verification...', {
    requestId,
    url: supabaseUrl.substring(0, 8) + '...',
    hasKey: !!supabaseAnonKey,
    env: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
    timestamp: new Date().toISOString()
  });

  try {
    // Test basic connection using auth status
    console.log('Testing auth connection...', { requestId });
    const { data: authData, error: authError } = await supabase.auth.getSession();
    console.log('Auth connection result:', {
      requestId,
      success: !authError,
      error: authError?.message,
      code: authError?.code,
      hasSession: !!authData?.session,
      vercelEnv: process.env.VERCEL_ENV,
      timestamp: new Date().toISOString()
    });
    
    if (authError) {
      console.error('Auth connection error:', {
        requestId,
        message: authError.message,
        code: authError.code,
        status: authError.status,
        vercelEnv: process.env.VERCEL_ENV
      });
      return;
    }

    // Test each table with detailed logging
    const tables = ['companies', 'company_users', 'profiles'];
    for (const table of tables) {
      const tableRequestId = `${requestId}-${table}`;
      console.log(`Testing table '${table}'...`, {
        tableRequestId,
        timestamp: new Date().toISOString(),
        vercelEnv: process.env.VERCEL_ENV
      });
      
      // First verify table exists and permissions
      const { data, error: tableError } = await supabase
        .from(table)
        .select('count')
        .limit(1)
        .throwOnError();

      console.log(`${table} access check:`, {
        tableRequestId,
        success: !tableError,
        error: tableError?.message,
        code: tableError?.code,
        hasData: !!data,
        vercelEnv: process.env.VERCEL_ENV,
        timestamp: new Date().toISOString()
      });

      if (tableError) {
        console.error(`${table} access error:`, {
          tableRequestId,
          message: tableError.message,
          code: tableError.code,
          details: tableError.details,
          hint: tableError.hint,
          status: tableError.status,
          vercelEnv: process.env.VERCEL_ENV,
          url: `${supabaseUrl}/rest/v1/${table}`
        });
      }
    }
  } catch (err) {
    console.error('Database verification failed:', {
      requestId,
      error: err instanceof Error ? err.message : 'Unknown error',
      stack: err instanceof Error ? err.stack : undefined,
      vercelEnv: process.env.VERCEL_ENV,
      timestamp: new Date().toISOString()
    });
  }
};

// Run verification immediately
verifyDatabase();

// Also verify on auth state change with request tracking
supabase.auth.onAuthStateChange((event: AuthEvent, session: UserSession) => {
  const authEventId = Math.random().toString(36).substring(7);
  console.log('Auth state changed:', {
    authEventId,
    event,
    hasSession: !!session,
    userId: session?.user?.id,
    vercelEnv: process.env.VERCEL_ENV,
    timestamp: new Date().toISOString()
  });
  
  if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
    verifyDatabase();
  }

  if (event === 'SIGNED_OUT') {
    localStorage.removeItem('company-auth-storage');
  }
});

// Export types
export type { AuthSession, AuthUser } from '@supabase/supabase-js'; 