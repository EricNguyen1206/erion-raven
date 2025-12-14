/**
 * Auth Guard
 * 
 * Protects routes that require authentication.
 * Uses the auth store to check if user is authenticated.
 * On first load, attempts to verify session with the server.
 */

import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';

export function AuthGuard() {
  const location = useLocation();
  const { isAuthenticated, loading, user, checkAuth, hasCheckedAuth } = useAuthStore();

  // Check auth on mount (only runs once due to hasCheckedAuth guard in store)
  useEffect(() => {
    console.log('AuthGuard: hasCheckedAuth', hasCheckedAuth);
    console.log('AuthGuard: loading', loading);
    if (!hasCheckedAuth && !loading) {
      checkAuth();
    }
  }, [hasCheckedAuth, loading]);

  // Show loading state while checking auth
  if (loading || !hasCheckedAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Not authenticated, redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
