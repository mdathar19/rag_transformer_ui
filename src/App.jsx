import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { PageLoading } from './components/Loading';

// Lazy load pages
const Login = lazy(() => import('./pages/Login').then(module => ({ default: module.Login })));
const Signup = lazy(() => import('./pages/Signup').then(module => ({ default: module.Signup })));
const UserDashboard = lazy(() => import('./pages/user/UserDashboard').then(module => ({ default: module.UserDashboard })));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard').then(module => ({ default: module.AdminDashboard })));

function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <PageLoading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Check if admin-only route and user is not admin
  if (adminOnly && user?.userType !== 'ADMIN') {
    return <Navigate to="/user/dashboard" />;
  }

  return children;
}

function PublicRoute({ children }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <PageLoading />;
  }

  if (isAuthenticated) {
    // Redirect based on user role
    if (user?.userType === 'ADMIN') {
      return <Navigate to="/admin/dashboard" />;
    } else {
      return <Navigate to="/user/dashboard" />;
    }
  }

  return children;
}

function RoleBasedRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return <PageLoading />;
  }

  // Redirect to appropriate dashboard based on role
  if (user?.userType === 'ADMIN') {
    return <Navigate to="/admin/dashboard" />;
  } else {
    return <Navigate to="/user/dashboard" />;
  }
}

function App() {
  return (
    <Suspense fallback={<PageLoading />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

        {/* User Routes */}
        <Route
          path="/user/dashboard/*"
          element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard/*"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Legacy /dashboard route - redirect based on role */}
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <RoleBasedRedirect />
            </ProtectedRoute>
          }
        />

        {/* Root redirect */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <RoleBasedRedirect />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Suspense>
  );
}

export default App;
