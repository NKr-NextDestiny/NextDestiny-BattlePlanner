import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { apiPost } from '@/lib/api';

export default function DiscordCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get('code');
    if (!code) {
      setError('No authorization code received from Discord.');
      return;
    }

    apiPost<{ data: { user: any; accessToken: string; teams: any[] } }>('/auth/discord/callback', { code })
      .then(({ data }) => {
        setAuth(data.user, data.accessToken, data.teams);
        navigate('/teams', { replace: true });
      })
      .catch((err) => {
        setError(err.message || 'Failed to authenticate with Discord.');
      });
  }, [searchParams, navigate, setAuth]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="mx-auto max-w-md rounded-lg border border-border bg-card p-8 text-center">
          <h2 className="mb-4 text-xl font-bold text-destructive">Login Failed</h2>
          <p className="mb-6 text-muted-foreground">{error}</p>
          <a
            href="/"
            className="inline-block rounded-md bg-primary px-6 py-2 text-primary-foreground hover:opacity-90"
          >
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <div className="mb-4 h-8 w-8 mx-auto animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-muted-foreground">Authenticating with Discord...</p>
      </div>
    </div>
  );
}
