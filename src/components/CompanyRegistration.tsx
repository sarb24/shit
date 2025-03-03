import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function CompanyRegistration() {
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const isMounted = useRef(true);

  // Verify database tables on component mount
  useEffect(() => {
    const verifyTables = async () => {
      console.log('Verifying database tables...', {
        timestamp: new Date().toISOString()
      });
      
      const tables = [
        { name: 'companies', requiredColumns: ['id', 'name', 'admin_email', 'created_by', 'created_at'] },
        { name: 'company_users', requiredColumns: ['id', 'company_id', 'user_id', 'role', 'created_at'] },
        { name: 'profiles', requiredColumns: ['id', 'email'] }
      ];

      for (const table of tables) {
        // Test table existence and permissions
        const { data, error: tableError } = await supabase
          .from(table.name)
          .select('*')
          .limit(1);
        
        console.log(`${table.name} verification:`, {
          exists: !tableError,
          error: tableError?.message,
          code: tableError?.code,
          status: tableError?.status,
          hasData: !!data,
          timestamp: new Date().toISOString()
        });

        if (tableError) {
          console.error(`${table.name} error:`, {
            message: tableError.message,
            code: tableError.code,
            details: tableError.details,
            hint: tableError.hint
          });
          continue;
        }

        // Test insert permission
        const testData = {
          companies: { name: 'test', admin_email: 'test@test.com' },
          company_users: { company_id: '00000000-0000-0000-0000-000000000000', user_id: '00000000-0000-0000-0000-000000000000', role: 'test' },
          profiles: { id: '00000000-0000-0000-0000-000000000000', email: 'test@test.com' }
        };

        const { error: insertError } = await supabase
          .from(table.name)
          .insert([testData[table.name as keyof typeof testData]])
          .select()
          .single();

        console.log(`${table.name} insert test:`, {
          success: !insertError || insertError.code === '23503', // Foreign key violation is expected
          error: insertError?.message,
          code: insertError?.code,
          status: insertError?.status,
          timestamp: new Date().toISOString()
        });
      }
    };

    verifyTables();
  }, []);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMounted.current) return;

    setIsLoading(true);
    setError(null);
    
    const requestId = Math.random().toString(36).substring(7);
    
    try {
      console.log('Starting company registration process...', {
        requestId,
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV
      });

      // Create auth user first
      console.log('Creating auth user...', {
        email,
        hasPassword: !!password,
        requestId
      });

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin + '/auth/callback'
        }
      });

      console.log('Auth response:', {
        success: !authError,
        error: authError?.message,
        status: authError?.status,
        name: authError?.name,
        details: authError?.details,
        hasUser: !!authData.user,
        userId: authData.user?.id,
        requestId
      });

      if (!isMounted.current) return;
      if (authError) throw authError;
      if (!authData.user) throw new Error('No user returned from sign up');

      // Create company record
      console.log('Creating company record...', {
        companyName,
        adminEmail: email,
        userId: authData.user.id,
        requestId
      });

      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .insert([
          {
            name: companyName,
            admin_email: email,
            created_by: authData.user.id,
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      console.log('Company response:', {
        success: !companyError,
        error: companyError?.message,
        code: companyError?.code,
        details: companyError?.details,
        hasData: !!companyData,
        companyId: companyData?.id,
        requestId
      });

      if (!isMounted.current) return;
      if (companyError) {
        console.error('Company creation error:', {
          message: companyError.message,
          code: companyError.code,
          details: companyError.details,
          hint: companyError.hint,
          requestId
        });
        throw companyError;
      }
      if (!companyData) throw new Error('Failed to create company record');

      // Create company_users record
      console.log('Creating company_users record...', {
        companyId: companyData.id,
        userId: authData.user.id,
        role: 'admin',
        requestId
      });

      const { error: roleError } = await supabase
        .from('company_users')
        .insert([
          {
            company_id: companyData.id,
            user_id: authData.user.id,
            role: 'admin',
            created_at: new Date().toISOString()
          }
        ]);

      console.log('Role assignment response:', {
        success: !roleError,
        error: roleError?.message,
        code: roleError?.code,
        details: roleError?.details,
        requestId
      });

      if (!isMounted.current) return;
      if (roleError) {
        console.error('Role assignment error:', {
          message: roleError.message,
          code: roleError.code,
          details: roleError.details,
          hint: roleError.hint,
          requestId
        });
        throw roleError;
      }

      console.log('Registration completed successfully', {
        userId: authData.user.id,
        companyId: companyData.id,
        requestId
      });

      // Sign in the user immediately after registration
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) {
        console.error('Auto sign-in error:', {
          message: signInError.message,
          code: signInError.code,
          details: signInError.details,
          requestId
        });
        // Don't throw here, just log the error
      }

      navigate('/dashboard');
    } catch (err) {
      console.error('Registration error:', {
        error: err instanceof Error ? err.message : 'Unknown error',
        code: (err as any)?.code,
        status: (err as any)?.status,
        details: (err as any)?.details,
        hint: (err as any)?.hint,
        stack: err instanceof Error ? err.stack : undefined,
        requestId
      });

      if (isMounted.current) {
        setError(
          err instanceof Error
            ? err.message
            : 'An error occurred during registration. Please try again.'
        );
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Register Company</h2>
        <form onSubmit={handleSubmit} className="space-y-6" id="company-registration-form">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <label htmlFor="company-name" className="block text-gray-900">
              Company Name:
            </label>
            <input
              id="company-name"
              name="companyName"
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
              className="w-full p-2 border border-gray-300 rounded-md bg-gray-50"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="admin-email" className="block text-gray-900">
              Admin Email:
            </label>
            <input
              id="admin-email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full p-2 border border-gray-300 rounded-md bg-gray-50"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="admin-password" className="block text-gray-900">
              Password:
            </label>
            <input
              id="admin-password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              minLength={6}
              className="w-full p-2 border border-gray-300 rounded-md bg-gray-50"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            className={`w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={isLoading}
          >
            {isLoading ? 'Registering...' : 'Register Company'}
          </button>
        </form>

        <p className="mt-4 text-center text-gray-900">
          Already have a company account?{' '}
          <Link 
            to="/login/company" 
            className="text-blue-600 hover:text-blue-700"
          >
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
} 