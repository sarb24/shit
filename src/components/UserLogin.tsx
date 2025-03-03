import React, { useState, useEffect, useRef, ChangeEvent, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function UserLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isMounted.current) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!isMounted.current) return;

      if (error) throw error;
      navigate('/dashboard');
    } catch (err) {
      if (isMounted.current) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-6" id="login-form">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <label htmlFor="login-email">Email:</label>
            <input
              id="login-email"
              name="email"
              type="email"
              value={email}
              onChange={handleEmailChange}
              required
              autoComplete="email"
              className="w-full p-2 border border-gray-300 rounded-md bg-gray-50"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="login-password">Password:</label>
            <input
              id="login-password"
              name="password"
              type="password"
              value={password}
              onChange={handlePasswordChange}
              required
              autoComplete="current-password"
              className="w-full p-2 border border-gray-300 rounded-md bg-gray-50"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            id="login-submit"
            className={`w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="mt-4 text-center text-gray-900">
          Don't have an account?{' '}
          <Link 
            to="/register" 
            className="text-blue-600 hover:text-blue-700"
          >
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
} 