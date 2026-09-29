import { Navigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { DEFAULT_LANG } from '@/i18n';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

// UX gate only; RLS + is_admin() is the real protection. AuthContext keeps
// `loading` true until admin status is resolved, so no extra query is needed.
const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();
  const { lang } = useParams<{ lang: string }>();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    // Redirect to login page, saving the attempted location
    return <Navigate to={`/${lang ?? DEFAULT_LANG}/login`} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
