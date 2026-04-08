import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { APP_NAME } from '@nd-battleplanner/shared';
import { Users } from 'lucide-react';

export default function TeamSelectionPage() {
  const navigate = useNavigate();
  const teams = useAuthStore((s) => s.teams);
  const setActiveTeamId = useAuthStore((s) => s.setActiveTeamId);
  const isAdmin = useAuthStore((s) => s.isAdmin);

  // Auto-select if only one team
  useEffect(() => {
    if (teams.length === 1) {
      setActiveTeamId(teams[0].id);
      navigate('/', { replace: true });
    }
  }, [teams, setActiveTeamId, navigate]);

  function handleSelectTeam(teamId: string) {
    setActiveTeamId(teamId);
    navigate('/');
  }

  if (teams.length === 1) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold text-foreground font-heading">{APP_NAME}</h1>
        <p className="text-muted-foreground">Select your team to get started</p>
      </div>

      <div className="grid max-w-3xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {teams.map((team) => (
          <button
            key={team.id}
            onClick={() => handleSelectTeam(team.id)}
            className="flex flex-col items-center gap-3 rounded-lg border border-border bg-card p-6 transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/10"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Users className="h-6 w-6" />
            </div>
            <span className="text-lg font-semibold text-foreground">{team.name}</span>
          </button>
        ))}
      </div>

      {teams.length === 0 && (
        <div className="text-center">
          <p className="text-muted-foreground">
            {isAdmin
              ? 'No teams configured yet. Go to Admin Panel to create teams.'
              : 'You are not assigned to any team. Contact an admin.'}
          </p>
          {isAdmin && (
            <a
              href="/admin/teams"
              className="mt-4 inline-block rounded-md bg-primary px-6 py-2 text-primary-foreground hover:opacity-90"
            >
              Manage Teams
            </a>
          )}
        </div>
      )}
    </div>
  );
}
