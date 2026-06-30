import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function ProtectedRoute({ allowedRole }) {
  const { isAuthenticated, role, initializing } = useAuth();

  // Wait for the localStorage session restore before deciding to redirect —
  // otherwise a hard refresh always bounces to login, since isAuthenticated
  // is briefly false on the very first render before AuthProvider's effect runs.
  if (initializing) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to={`/login/${allowedRole}`} replace />;
  }

  if (allowedRole && role !== allowedRole) {
    return <Navigate to={`/dashboard/${role}`} replace />;
  }

  return <Outlet />;
}
