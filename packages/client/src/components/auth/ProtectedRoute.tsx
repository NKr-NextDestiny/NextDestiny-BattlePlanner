import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';

export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/" replace />;
  return <Outlet />;
}

export function AdminRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isAdmin = useAuthStore((s) => s.isAdmin);
  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return <Outlet />;
}

export function TeamRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const activeTeamId = useAuthStore((s) => s.activeTeamId);
  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (!activeTeamId) return <Navigate to="/teams" replace />;
  return <Outlet />;
}
