import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

// Define a User interface that matches Supabase's user structure
interface User {
  id: string;
  email?: string;
  app_metadata: {
    provider?: string;
    [key: string]: any;
  };
  user_metadata: {
    [key: string]: any;
  };
  aud: string;
  created_at: string;
}

interface CompanyData {
  id: string;
  name: string;
  admin_email: string;
  last_login?: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No user found');
        
        setCurrentUser(user);

        // First try to get company where user is admin
        let { data: companyData, error: companyError } = await supabase
          .from('companies')
          .select('*')
          .eq('admin_email', user.email)
          .single();

        // If not an admin, check company_users table
        if (!companyData) {
          const { data: companyUserData, error: companyUserError } = await supabase
            .from('company_users')
            .select(`
              companies (
                id,
                name,
                admin_email
              )
            `)
            .eq('user_id', user.id)
            .single();

          if (companyUserError) throw companyUserError;
          if (companyUserData) {
            companyData = companyUserData.companies;
          }
        }

        if (companyError) throw companyError;
        setCompanyData(companyData);
      } catch (err) {
        console.error('Error fetching company data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load company data');
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, []);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      localStorage.removeItem('my-custom-storage-key');
      localStorage.removeItem('company-auth-storage');
      
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!companyData || !currentUser) return <div>No company data found</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Company Dashboard</h1>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Company Information</h2>
          </div>
          
          <div className="px-6 py-6">
            <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <InfoField label="Company Name" value={companyData.name} />
              <InfoField label="Admin Email" value={companyData.admin_email} />
              <InfoField 
                label="Role" 
                value={companyData.admin_email === currentUser.email ? 'Admin' : 'Member'} 
              />
              <InfoField label="Last Login" value={new Date().toLocaleDateString()} />
            </dl>
          </div>
        </div>

        {/* Additional Dashboard Sections */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DashboardCard title="Users" value="0" />
          <DashboardCard title="Active Projects" value="0" />
          <DashboardCard title="Total Revenue" value="$0" />
        </div>
      </main>
    </div>
  );
};

// Reusable components
const InfoField = ({ label, value }: { label: string; value: string }) => (
  <div>
    <dt className="text-sm font-medium text-gray-500">{label}</dt>
    <dd className="mt-1 text-lg text-gray-900">{value}</dd>
  </div>
);

const DashboardCard = ({ title, value }: { title: string; value: string }) => (
  <div className="bg-white rounded-lg shadow px-6 py-5">
    <h3 className="text-sm font-medium text-gray-500">{title}</h3>
    <p className="mt-3 text-3xl font-semibold text-gray-900">{value}</p>
  </div>
);

export default Dashboard; 