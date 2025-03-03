import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useCompany } from './CompanyContext';

export const UserRegistrationForm: React.FC = () => {
  const { currentCompany } = useCompany();
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: 'user'
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      if (!currentCompany) {
        throw new Error('No company selected');
      }

      const { error } = await supabase
        .from('company_users')
        .insert([
          {
            email: formData.email,
            first_name: formData.firstName,
            last_name: formData.lastName,
            role: formData.role,
            company_id: currentCompany.id
          }
        ]);

      if (error) throw error;
      
      setSuccess('User registered successfully');
      setFormData({ email: '', firstName: '', lastName: '', role: 'user' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error registering user');
      console.error('Error registering user:', err);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="space-y-6 max-w-md mx-auto"
      aria-label="User Registration Form"
    >
      {error && (
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded" role="alert">
          <p>{success}</p>
        </div>
      )}

      <div className="form-group">
        <label htmlFor="register-email" className="block text-sm font-medium text-gray-700">
          Email Address
        </label>
        <div className="mt-1">
          <input
            id="register-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            aria-describedby="email-description"
          />
          <p id="email-description" className="mt-1 text-sm text-gray-500">
            Work email address
          </p>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="register-firstName" className="block text-sm font-medium text-gray-700">
          First Name
        </label>
        <div className="mt-1">
          <input
            id="register-firstName"
            name="firstName"
            type="text"
            required
            autoComplete="given-name"
            value={formData.firstName}
            onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="register-lastName" className="block text-sm font-medium text-gray-700">
          Last Name
        </label>
        <div className="mt-1">
          <input
            id="register-lastName"
            name="lastName"
            type="text"
            required
            autoComplete="family-name"
            value={formData.lastName}
            onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="register-role" className="block text-sm font-medium text-gray-700">
          Role
        </label>
        <div className="mt-1">
          <select
            id="register-role"
            name="role"
            value={formData.role}
            onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Register User
      </button>
    </form>
  );
}; 