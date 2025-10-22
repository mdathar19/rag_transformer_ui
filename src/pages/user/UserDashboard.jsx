import { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ThemeToggle } from '../../components/ThemeToggle';
import { userWebsitesAPI } from '../../api/userAPI';
import { UserWebsites } from './UserWebsites';
import { WebsiteDetails } from './WebsiteDetails';
import { UserChat } from './UserChat';
import {
  LayoutDashboard,
  Globe,
  MessageSquare,
  Settings,
  LogOut,
  User,
  Sparkles,
  Mail,
  Phone
} from 'lucide-react';

function UserDashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Overview', path: '/user/dashboard' },
    { icon: Globe, label: 'My Websites', path: '/user/dashboard/websites' },
    { icon: MessageSquare, label: 'Chat', path: '/user/dashboard/chat' },
    { icon: Settings, label: 'Settings', path: '/user/dashboard/settings' },
  ];

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-5 flex flex-col h-screen sticky top-0">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center">
              <img src="/favicon_io/android-chrome-192x192.png" alt="RunIt Logo" className="w-10 h-10" />
            </div>
            <div>
              <p className="text-base font-bold text-gray-900 dark:text-white font-saira">RunIt LAB</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">User Portal</p>
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

          {/* Contact Info */}
          <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-xs font-semibold text-blue-900 dark:text-blue-200 uppercase tracking-wider mb-2">
              Need Help?
            </p>
            <div className="space-y-2">
              <a
                href="mailto:no-reply@runit.in"
                className="flex items-center gap-2 text-xs text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 transition-colors group"
              >
                <Mail size={14} className="flex-shrink-0" />
                <span className="truncate group-hover:underline">no-reply@runit.in</span>
              </a>
              <a
                href="mailto:mdathar19@gmail.com"
                className="flex items-center gap-2 text-xs text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 transition-colors group"
              >
                <Mail size={14} className="flex-shrink-0" />
                <span className="truncate group-hover:underline">mdathar19@gmail.com</span>
              </a>
              <a
                href="tel:+918617852693"
                className="flex items-center gap-2 text-xs text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 transition-colors group"
              >
                <Phone size={14} className="flex-shrink-0" />
                <span className="group-hover:underline">+91-8617852693</span>
              </a>
            </div>
          </div>

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
                  {user?.email}
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
              Welcome, {user?.companyName}!
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">My Workspace</p>
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

function UserOverview() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [website, setWebsite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadWebsite();
  }, []);

  const loadWebsite = async () => {
    try {
      setLoading(true);
      const response = await userWebsitesAPI.list();
      const sites = response.data.clients || [];

      if (sites.length > 0) {
        setWebsite(sites[0]);
      }
    } catch (err) {
      console.error('Failed to load website:', err);
      setError(err.error || 'Failed to load website');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!website) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 font-saira">Dashboard Overview</h2>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          <div className="flex flex-col items-center gap-4 text-center">
            <Sparkles size={48} className="text-primary-600 dark:text-primary-400" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white font-saira">Get Started</h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md">
              Add your first website to start building your AI-powered knowledge base
            </p>
            <Link to="/user/dashboard/websites">
              <button className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800">
                Add My First Website
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 font-saira">Dashboard Overview</h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-3">
            <Globe className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Pages Indexed</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{website.contentCount || 0}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-3">
            <Sparkles className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Embeddings</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{website.usage?.embeddingsGenerated || 0}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-3">
            <MessageSquare className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Domains</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{website.domains?.length || 0}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-3">
            <Settings className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Status</p>
          <p className="text-lg font-bold text-green-600 dark:text-green-400 capitalize">{website.status || 'Active'}</p>
        </div>
      </div>

      {/* Website Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{website.name}</h3>
            <a
              href={website.domain}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1 mb-3"
            >
              {website.domain}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
            {website.metadata?.description && (
              <p className="text-gray-600 dark:text-gray-400 mb-4">{website.metadata.description}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Last Crawled</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {website.lastCrawl ? new Date(website.lastCrawl).toLocaleDateString() : 'Never'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Industry</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {website.metadata?.industry || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Max Pages</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {website.crawlSettings?.maxPages || 100}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <button
          onClick={() => navigate('/user/dashboard/websites')}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:border-primary-400 dark:hover:border-primary-600 transition-all text-left group"
        >
          <Globe className="w-10 h-10 text-primary-600 dark:text-primary-400 mb-3" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400">
            Manage Website
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            View details and manage subdomains
          </p>
        </button>

        <button
          onClick={() => navigate('/user/dashboard/chat')}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:border-blue-400 dark:hover:border-blue-600 transition-all text-left group"
        >
          <MessageSquare className="w-10 h-10 text-blue-600 dark:text-blue-400 mb-3" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400">
            Start Chatting
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Ask questions about your content
          </p>
        </button>

        <button
          onClick={() => navigate('/user/dashboard/settings')}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:border-green-400 dark:hover:border-green-600 transition-all text-left group"
        >
          <Settings className="w-10 h-10 text-green-600 dark:text-green-400 mb-3" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-green-600 dark:group-hover:text-green-400">
            Settings
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage your account settings
          </p>
        </button>
      </div>
    </div>
  );
}

function UserSettingsPage() {
  const { user } = useAuth();

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-2 mb-6">
        <Settings size={32} className="text-gray-900 dark:text-white" />
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white font-saira">Settings</h2>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-5">
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white font-saira">Account Information</h3>
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
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Account ID</p>
              <p className="text-base text-gray-900 dark:text-white font-mono">{user?.brokerId}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white font-saira">Subscription</h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Plan</p>
              <p className="text-base text-gray-900 dark:text-white capitalize">
                {user?.subscription?.plan || 'Free'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Max API Calls</p>
              <p className="text-base text-gray-900 dark:text-white">
                {user?.subscription?.maxApiCalls?.toLocaleString() || 'Unlimited'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function UserDashboard() {
  return (
    <UserDashboardLayout>
      <Routes>
        <Route path="/" element={<UserOverview />} />
        <Route path="/websites" element={<UserWebsites />} />
        <Route path="/websites/:brokerId" element={<WebsiteDetails />} />
        <Route path="/chat" element={<UserChat />} />
        <Route path="/settings" element={<UserSettingsPage />} />
      </Routes>
    </UserDashboardLayout>
  );
}
