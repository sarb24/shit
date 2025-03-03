import React from 'react';
import { Link } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <nav className="fixed top-0 left-0 h-full w-64 bg-white shadow-lg">
        <div className="px-4 py-6">
          <h2 className="text-lg font-semibold">Navigation</h2>
          <ul className="mt-6 space-y-2">
            <NavItem to="/dashboard" label="Dashboard" />
            <NavItem to="/users" label="Users" />
            <NavItem to="/projects" label="Projects" />
            <NavItem to="/settings" label="Settings" />
          </ul>
        </div>
      </nav>

      {/* Main Content */}
      <div className="ml-64">
        {children}
      </div>
    </div>
  );
};

const NavItem = ({ to, label }: { to: string; label: string }) => (
  <li>
    <Link
      to={to}
      className="block px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-md"
    >
      {label}
    </Link>
  </li>
);

export default Layout; 