import { DashboardLayout } from '../components/DashboardLayout';
import { UserRegistrationForm } from '../components/UserRegistrationForm';
import { useCompany } from '../components/CompanyContext';

export const Dashboard = () => {
  const { currentCompany } = useCompany();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Register New User
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Add a new user to {currentCompany?.name}
              </p>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-2">
              <UserRegistrationForm />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}; 