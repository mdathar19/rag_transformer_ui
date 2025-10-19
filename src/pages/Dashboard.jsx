import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ThemeToggle } from '../components/ThemeToggle';
import { Button } from '../components/primitives/Button';
import { Websites } from './WebsitesEnhanced';
import { Chat } from './Chat';
import {
  LayoutDashboard,
  Globe,
  MessageSquare,
  Settings,
  LogOut,
  User,
  Sparkles
} from 'lucide-react';

function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Overview', path: '/dashboard' },
    { icon: Globe, label: 'Websites', path: '/dashboard/websites' },
    { icon: MessageSquare, label: 'Query & Chat', path: '/dashboard/query' },
    { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: '260px',
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-color)',
        padding: 'var(--spacing-lg)',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Logo */}
        <div style={{
          marginBottom: 'var(--spacing-xl)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--spacing-md)',
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--border-radius-md)',
            background: 'var(--purple-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Sparkles size={24} color="white" />
          </div>
          <div>
            <div style={{ fontWeight: '700', fontSize: '1.125rem' }}>RAG Platform</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {user?.userType === 'ADMIN' ? 'Admin' : 'User'}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1 }}>
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-md)',
                padding: 'var(--spacing-md)',
                marginBottom: 'var(--spacing-sm)',
                borderRadius: 'var(--border-radius-md)',
                textDecoration: 'none',
                color: 'var(--text-primary)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--bg-tertiary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* User Info */}
        <div style={{
          padding: 'var(--spacing-md)',
          background: 'var(--bg-tertiary)',
          borderRadius: 'var(--border-radius-md)',
          marginBottom: 'var(--spacing-md)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'var(--purple-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
            }}>
              <User size={18} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                {user?.companyName}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {user?.email}
              </div>
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={handleLogout}
          style={{ width: '100%' }}
        >
          <LogOut size={16} style={{ marginRight: 'var(--spacing-sm)' }} />
          Logout
        </Button>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <header style={{
          height: '64px',
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-color)',
          padding: '0 var(--spacing-xl)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>
              Welcome, {user?.companyName}!
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
              Broker ID: {user?.brokerId}
            </p>
          </div>
          <ThemeToggle />
        </header>

        {/* Content Area */}
        <div style={{
          flex: 1,
          padding: 'var(--spacing-xl)',
          overflowY: 'auto',
        }}>
          {children}
        </div>
      </main>
    </div>
  );
}

function Overview() {
  return (
    <div>
      <h2 style={{ marginBottom: 'var(--spacing-lg)' }}>Dashboard Overview</h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: 'var(--spacing-lg)',
      }}>
        {[
          { label: 'Websites', value: '0', color: '#a855f7' },
          { label: 'Total Queries', value: '0', color: '#7e22ce' },
          { label: 'Crawled Pages', value: '0', color: '#6b21a8' },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              padding: 'var(--spacing-lg)',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--border-radius-lg)',
            }}
          >
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-sm)' }}>
              {stat.label}
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: stat.color }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>
      <div style={{
        marginTop: 'var(--spacing-xl)',
        padding: 'var(--spacing-xl)',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--border-radius-lg)',
        textAlign: 'center',
      }}>
        <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Get Started</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--spacing-lg)' }}>
          Add your first website to start crawling and querying content
        </p>
        <Link to="/dashboard/websites">
          <Button>Add Website</Button>
        </Link>
      </div>
    </div>
  );
}

function SettingsPage() {
  const { user } = useAuth();

  return (
    <div style={{ padding: 'var(--spacing-xl)', maxWidth: '800px' }}>
      <h2 style={{ marginBottom: 'var(--spacing-xl)' }}>
        <Settings size={32} style={{ display: 'inline', marginRight: 'var(--spacing-sm)', verticalAlign: 'middle' }} />
        Settings
      </h2>

      <div style={{
        padding: 'var(--spacing-xl)',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--border-radius-lg)',
        marginBottom: 'var(--spacing-lg)'
      }}>
        <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Account Information</h3>
        <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-xs)' }}>
              Company Name
            </div>
            <div>{user?.companyName}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-xs)' }}>
              Email
            </div>
            <div>{user?.email}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-xs)' }}>
              Broker ID
            </div>
            <div style={{ fontFamily: 'monospace' }}>{user?.brokerId}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-xs)' }}>
              Account Type
            </div>
            <div style={{
              display: 'inline-block',
              padding: '4px 12px',
              borderRadius: '4px',
              background: 'var(--purple-gradient)',
              color: 'white',
              fontSize: '0.875rem',
              fontWeight: '600'
            }}>
              {user?.userType}
            </div>
          </div>
        </div>
      </div>

      <div style={{
        padding: 'var(--spacing-xl)',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--border-radius-lg)',
      }}>
        <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Subscription</h3>
        <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-xs)' }}>
              Plan
            </div>
            <div style={{ textTransform: 'capitalize' }}>{user?.subscription?.plan || 'Free'}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-xs)' }}>
              Max API Calls
            </div>
            <div>{user?.subscription?.maxApiCalls?.toLocaleString() || 'Unlimited'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Dashboard() {
  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<Overview />} />
        <Route path="/websites" element={<Websites />} />
        <Route path="/query" element={<Chat />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </DashboardLayout>
  );
}
