import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Loader2 } from 'lucide-react';

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { getProfile } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const searchParams = new URLSearchParams(location.search);
      const isSuccess = searchParams.get('success') === 'true';
      const errorMessage = searchParams.get('error');

      if (errorMessage) {
        setError(decodeURIComponent(errorMessage));
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      if (isSuccess) {
        try {
          // Tokens are in httpOnly cookies, just hydrate the store
          await getProfile();
          // Assuming the default authenticated route is empty or /
          // Need to check where users normally get redirected after login. Usually it's '/' or '/dashboard'.
          navigate('/', { replace: true });
        } catch (err) {
          setError('Failed to load user profile');
          setTimeout(() => navigate('/login'), 3000);
        }
      } else {
        setError('Invalid callback parameters');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleCallback();
  }, [location, navigate, getProfile]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-900">
        <div className="bg-red-900/50 border border-red-500 text-red-200 p-6 rounded-lg shadow-lg max-w-md text-center">
          <h2 className="text-xl font-bold mb-2">Authentication Failed</h2>
          <p>{error}</p>
          <p className="text-sm mt-4 text-red-300">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-900">
      <Loader2 className="h-12 w-12 text-primary-500 animate-spin mb-4" />
      <h2 className="text-xl font-semibold text-white">Completing login...</h2>
      <p className="text-neutral-400 mt-2">Please wait while we redirect you.</p>
    </div>
  );
}
