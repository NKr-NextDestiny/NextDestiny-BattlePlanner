import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { Users, Shield } from 'lucide-react';

export default function TeamSelectionPage() {
  const navigate = useNavigate();
  const teams = useAuthStore((s) => s.teams);
  const setActiveTeamId = useAuthStore((s) => s.setActiveTeamId);
  const isAdmin = useAuthStore((s) => s.isAdmin);

  // Auto-select if only one team
  useEffect(() => {
    if (teams.length === 1) {
      setActiveTeamId(teams[0]!.id);
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-background gaming-bg relative overflow-hidden p-6">
      <div className="gaming-glow-line top-0 left-0 z-50" />

      {/* Floating particles */}
      <span className="gaming-particle" style={{ left: '15%', bottom: '25%', animationDelay: '0s' }} />
      <span className="gaming-particle" style={{ right: '20%', bottom: '35%', animationDelay: '2s' }} />
      <span className="gaming-particle" style={{ left: '40%', bottom: '15%', animationDelay: '4s' }} />

      <div className="relative z-10 w-full max-w-3xl">
        <div className="mb-10 text-center">
          <img
            src="/nd-logo.png"
            alt="Next Destiny"
            className="logo-glow w-24 h-24 rounded-2xl mb-6 mx-auto"
          />
          <h1 className="text-3xl font-bold text-foreground font-heading mb-2">Wähle dein Team</h1>
          <p className="text-muted-foreground">Wähle ein Team um fortzufahren.</p>
        </div>

        {teams.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {teams.map((team) => (
              <button
                key={team.id}
                onClick={() => handleSelectTeam(team.id)}
                className="group relative flex flex-col items-center gap-3 rounded-lg border border-border/60 bg-card/80 p-6 transition-all hover:border-primary/60 hover:shadow-lg hover:shadow-primary/10 hover:scale-[1.02]"
              >
                <div className="absolute inset-0 rounded-lg bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all">
                  <Users className="h-7 w-7" />
                </div>
                <span className="relative text-lg font-semibold text-foreground">{team.name}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center rounded-lg border border-border/60 bg-card/80 p-10">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mx-auto mb-4">
              <Users className="h-8 w-8" />
            </div>
            <p className="text-muted-foreground mb-6">
              {isAdmin
                ? 'Noch keine Teams konfiguriert.'
                : 'Du bist keinem Team zugewiesen. Kontaktiere einen Admin.'}
            </p>
            {isAdmin && (
              <Link
                to="/admin/teams"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-primary-foreground font-semibold hover:brightness-110 transition-all"
              >
                <Shield className="h-4 w-4" />
                Teams verwalten
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
