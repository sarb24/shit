import { 
  createBrowserRouter,
  RouterProvider,
  createRoutesFromElements,
  Route
} from 'react-router-dom';
import { Suspense, lazy } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import { CompanyProvider } from './components/CompanyContext';
import LoadingSpinner from './components/LoadingSpinner';
import NotFound from './components/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Lazy load components
const Login = lazy(() => import('./pages/Login'));
const CompanyRegister = lazy(() => import('./pages/CompanyRegister'));
const Dashboard = lazy(() => import('./components/Dashboard'));

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      <Route index element={<Login />} />
      <Route path="login" element={<Login />} />
      <Route path="register" element={<CompanyRegister />} />
      <Route 
        path="dashboard" 
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <Layout>
              <div className="p-8">Users Page (Coming Soon)</div>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects"
        element={
          <ProtectedRoute>
            <Layout>
              <div className="p-8">Projects Page (Coming Soon)</div>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Layout>
              <div className="p-8">Settings Page (Coming Soon)</div>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Route>
  ),
  {
    future: {
      v7_relativeSplatPath: true
    }
  }
);

function App() {
  return (
    <ErrorBoundary>
      <CompanyProvider>
        <Suspense fallback={<LoadingSpinner />}>
          <RouterProvider router={router} />
        </Suspense>
      </CompanyProvider>
    </ErrorBoundary>
  );
}

export default App;
