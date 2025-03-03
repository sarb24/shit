import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const CompanyRegister = () => {
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data: { user }, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;
      if (!user) throw new Error('No user returned from sign up');

      const { error: companyError } = await supabase
        .from('companies')
        .insert([
          {
            name: companyName,
            admin_email: email,
          }
        ]);

      if (companyError) throw companyError;

      navigate('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          Register Company
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6" id="company-register-form">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="register-company-name" className="block text-gray-900">
              Company Name:
            </label>
            <input
              id="register-company-name"
              name="companyName"
              type="text"
              autoComplete="organization"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md bg-gray-50"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="register-email" className="block text-gray-900">
              Admin Email:
            </label>
            <input
              id="register-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md bg-gray-50"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="register-password" className="block text-gray-900">
              Password:
            </label>
            <input
              id="register-password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            {isLoading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className="mt-4 text-center text-gray-900">
          Already have an account?{' '}
          <Link 
            to="/login" 
            className="text-blue-600 hover:text-blue-700"
          >
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default CompanyRegister; 