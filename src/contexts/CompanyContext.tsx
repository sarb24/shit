import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Company {
  id: string;
  name: string;
  admin_email: string;
}

type UserRole = 'admin' | 'member' | null;

interface CompanyContextType {
  currentCompany: Company | null;
  userRole: UserRole;
  loading: boolean;
  error: string | null;
}

const CompanyContext = createContext<CompanyContextType>({
  currentCompany: null,
  userRole: null,
  loading: true,
  error: null,
});

export function CompanyProvider({ children }: { children: React.ReactNode }) {
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;
        
        if (!session?.user?.email) {
          setLoading(false);
          return;
        }

        // First check if user is a company admin
        const { data: adminData } = await supabase
          .from('companies')
          .select('id, name, admin_email')
          .eq('admin_email', session.user.email)
          .maybeSingle();

        if (adminData) {
          const typedAdminData: Company = {
            id: String(adminData.id),
            name: String(adminData.name),
            admin_email: String(adminData.admin_email)
          };
          setCurrentCompany(typedAdminData);
          setUserRole('admin');
          setLoading(false);
          return;
        }

        // If not admin, check for company user
        const { data } = await supabase
          .from('company_users')
          .select(`
            role,
            company:companies!inner (
              id,
              name,
              admin_email
            )
          `)
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (data?.company) {
          const companyData: Company = {
            id: (data.company as any).id,
            name: (data.company as any).name,
            admin_email: (data.company as any).admin_email
          };
          setCurrentCompany(companyData);
          setUserRole(data.role as UserRole);
        }
      } catch (err) {
        console.error('Error fetching company data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load company data');
      } finally {
        setLoading(false);
      }
    };

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
        error
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
}

export const useCompany = () => {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
}; 