import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// Types
export interface Company {
  id: string;
  name: string;
  admin_email: string;
}

interface CompanyData {
  role: 'admin' | 'member';
  company: {
    id: string;
    name: string;
    admin_email: string;
  };
}

// Remove or comment out unused type
// interface DatabaseCompany {
//   id: string;
//   name: string;
//   admin_email: string;
// }

// Remove or comment out the unused DatabaseResponse type
// type DatabaseResponse = ...

export interface CompanyContextType {
  currentCompany: Company | null;
  userRole: 'admin' | 'member' | null;
  loading: boolean;
  error: string | null;
  setCurrentCompany: (company: Company | null) => void;
  fetchCompanyData: () => Promise<void>;
}

// Create Context
const CompanyContext = createContext<CompanyContextType>({
  currentCompany: null,
  userRole: null,
  loading: true,
  error: null,
  setCurrentCompany: () => {},
  fetchCompanyData: async () => {},
});

// Provider Component
export const CompanyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [userRole, setUserRole] = useState<'admin' | 'member' | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanyData = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) throw sessionError;
      
      if (!session) {
        setLoading(false);
        return;
      }

      const { data, error: companyError } = await supabase
        .from('company_users')
        .select(`
          role,
          company:companies (
            id,
            name,
            admin_email
          )
        `)
        .eq('user_id', session.user.id)
        .single();

      if (companyError) throw companyError;

      if (data) {
        const typedData = data as unknown as CompanyData;
        setCurrentCompany(typedData.company);
        setUserRole(typedData.role);
      }
    } catch (err) {
      console.error('Error fetching company data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load company data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchCompanyData();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <CompanyContext.Provider 
      value={{ 
        currentCompany, 
        userRole,
        loading,
        error,
        setCurrentCompany,
        fetchCompanyData
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
};

// Hook
export const useCompany = () => {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
};

export default CompanyContext; 