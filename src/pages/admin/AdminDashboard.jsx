import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ThemeToggle } from '../../components/ThemeToggle';
import { AdminWebsites } from './AdminWebsites';
import { AdminChat } from './AdminChat';
import {
  LayoutDashboard,
  Globe,
  MessageSquare,
  Settings,
  LogOut,
  User,
  Sparkles,
  Users
} from 'lucide-react';

function AdminDashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Overview', path: '/admin/dashboard' },
    { icon: Globe, label: 'All Websites', path: '/admin/dashboard/websites' },
    { icon: Users, label: 'Users', path: '/admin/dashboard/users' },
    { icon: MessageSquare, label: 'Query & Chat', path: '/admin/dashboard/query' },
    { icon: Settings, label: 'Settings', path: '/admin/dashboard/settings' },
  ];

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-5 flex flex-col h-screen sticky top-0">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-md">
              <Sparkles size={24} color="white" />
            </div>
            <div>
              <p className="text-base font-bold text-gray-900 dark:text-white font-saira">RagSense LAB</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Admin Portal</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 flex flex-col gap-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors group ${
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <item.icon
                    size={20}
                    className={`transition-colors ${
                      isActive
                        ? 'text-primary-600 dark:text-primary-400'
                        : 'text-gray-600 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400'
                    }`}
                  />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Info */}
          <div className="p-3 mb-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center flex-shrink-0">
                <User size={18} color="white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.companyName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  Admin
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-lg border border-gray-300 dark:border-gray-600 transition-colors"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-0.5 font-saira">
              Admin Dashboard
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Manage all users and websites</p>
          </div>
          <ThemeToggle />
        </header>

        {/* Content Area */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

function AdminOverview() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 font-saira">Admin Overview</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        {[
          { label: 'Total Users', value: '0', color: 'primary' },
          { label: 'Total Websites', value: '0', color: 'violet' },
          { label: 'Total Queries', value: '0', color: 'purple' },
          { label: 'Crawled Pages', value: '0', color: 'blue' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex flex-col gap-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
              <p className="text-4xl font-bold text-primary-600 dark:text-primary-400">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <Sparkles size={48} className="text-primary-600 dark:text-primary-400" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white font-saira">Admin Portal</h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md">
            Manage all users, websites, and system settings from this dashboard
          </p>
          <div className="flex gap-3">
            <Link to="/admin/dashboard/websites">
              <button className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors">
                View All Websites
              </button>
            </Link>
            <Link to="/admin/dashboard/users">
              <button className="px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-lg transition-colors">
                Manage Users
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminUsersPage() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Users size={32} className="text-gray-900 dark:text-white" />
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white font-saira">User Management</h2>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
        <p className="text-gray-600 dark:text-gray-400">User management coming soon...</p>
      </div>
    </div>
  );
}

function AdminSettingsPage() {
  const { user } = useAuth();

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-2 mb-6">
        <Settings size={32} className="text-gray-900 dark:text-white" />
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white font-saira">Admin Settings</h2>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-5">
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white font-saira">Admin Account</h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Company Name</p>
              <p className="text-base text-gray-900 dark:text-white">{user?.companyName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Email</p>
              <p className="text-base text-gray-900 dark:text-white">{user?.email}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Broker ID</p>
              <p className="text-base text-gray-900 dark:text-white font-mono">{user?.brokerId}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Account Type</p>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300">
                ADMIN
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminDashboard() {
  return (
    <AdminDashboardLayout>
      <Routes>
        <Route path="/" element={<AdminOverview />} />
        <Route path="/websites" element={<AdminWebsites />} />
        <Route path="/users" element={<AdminUsersPage />} />
        <Route path="/query" element={<AdminChat />} />
        <Route path="/settings" element={<AdminSettingsPage />} />
      </Routes>
    </AdminDashboardLayout>
  );
}
