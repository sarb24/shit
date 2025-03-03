import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useCompany } from './CompanyContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { currentCompany } = useCompany();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/login');
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              {/* Logo or Company Name */}
              <h1 className="text-2xl font-bold text-gray-900">
                {currentCompany?.name || 'Dashboard'}
              </h1>
            </div>
            
            {/* Navigation */}
            <nav className="flex items-center space-x-6">
              <a 
                href="/dashboard" 
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Home
              </a>
              <a 
                href="/profile" 
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Profile
              </a>
              <a 
                href="/settings" 
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Settings
              </a>
              <button 
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white shadow-md mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="text-gray-500">
              <p>&copy; 2024 {currentCompany?.name || 'Your Company'}. All rights reserved.</p>
            </div>
            <div className="flex space-x-6">
              <a 
                href="/privacy" 
                className="text-gray-500 hover:text-gray-700"
              >
                Privacy Policy
              </a>
              <a 
                href="/terms" 
                className="text-gray-500 hover:text-gray-700"
              >
                Terms of Service
              </a>
              <a 
                href="/contact" 
                className="text-gray-500 hover:text-gray-700"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}; 