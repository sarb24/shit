import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function UserRegistration() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMounted.current) return;

    setIsLoading(true);
    try {
      console.log('Starting user registration process...');
      
      // Create auth user
      console.log('Creating auth user...');
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
          emailRedirectTo: window.location.origin + '/auth/callback'
        }
      });

      if (!isMounted.current) return;
      if (authError) {
        console.error('Auth error:', authError);
        throw authError;
      }
      if (!data.user) {
        console.error('No user returned from sign up');
        throw new Error('No user returned from sign up');
      }

      console.log('Auth user created successfully:', data.user.id);

      // Create user profile
      console.log('Creating user profile...');
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: data.user.id,
            email: email
          }
        ])
        .select();

      if (!isMounted.current) return;
      if (profileError) {
        console.error('Profile creation error:', profileError);
        throw profileError;
      }

      console.log('Profile created successfully');
      navigate('/dashboard');
    } catch (err) {
      console.error('Registration error:', err);
      if (isMounted.current) {
        if (err instanceof Error) {
          setError(err.message);
          console.error('Detailed error:', {
            message: err.message,
            name: err.name,
            stack: err.stack
          });
        } else {
          setError('An error occurred during registration');
          console.error('Unknown error type:', err);
        }
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
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Register User</h2>
        <form onSubmit={handleSubmit} className="space-y-6" id="user-registration-form">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <label htmlFor="first-name" className="block text-gray-900">
              First Name:
            </label>
            <input
              id="first-name"
              name="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              autoComplete="given-name"
              className="w-full p-2 border border-gray-300 rounded-md bg-gray-50"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="last-name" className="block text-gray-900">
              Last Name:
            </label>
            <input
              id="last-name"
              name="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              autoComplete="family-name"
              className="w-full p-2 border border-gray-300 rounded-md bg-gray-50"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="user-email" className="block text-gray-900">
              Email:
            </label>
            <input
              id="user-email"
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
            <label htmlFor="user-password" className="block text-gray-900">
              Password:
            </label>
            <input
              id="user-password"
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
} 