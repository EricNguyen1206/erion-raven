/**
 * Guest Guard
 * 
 * Protects routes that should only be accessible to non-authenticated users.
 * Redirects to messages if user is already authenticated.
 */

import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';

export function GuestGuard() {
  const { isAuthenticated, loading, checkAuth, user, hasCheckedAuth } = useAuthStore();

  // Check auth on mount (only runs once due to hasCheckedAuth guard in store)
  useEffect(() => {
    if (!hasCheckedAuth && !loading) {
      checkAuth();
    }
  }, [hasCheckedAuth, loading, checkAuth]);

  // Show loading state while checking auth
  if (loading || !hasCheckedAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Already authenticated, redirect to messages
  if (isAuthenticated && user) {
    return <Navigate to="/messages" replace />;
  }

  return <Outlet />;
}
