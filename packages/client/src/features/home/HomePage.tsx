import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { apiGet } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, Users, Gamepad2 } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';

interface Game {
  id: string; name: string; slug: string; icon: string | null; description: string | null;
}

export default function HomePage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const activeTeamId = useAuthStore((s) => s.activeTeamId);
  const { data, isLoading } = useQuery({
    queryKey: ['games'],
    queryFn: () => apiGet<{ data: Game[] }>('/games'),
    enabled: isAuthenticated && !!activeTeamId,
  });

  const handleDiscordLogin = () => {
    apiGet<{ data: { url: string } }>('/auth/discord/url').then(({ data }) => {
      window.location.href = data.url;
    });
  };

  return (
    <div className="relative overflow-hidden">
      {/* Hero */}
      <div className="container mx-auto px-4 py-16 relative z-10">
        {!isAuthenticated ? (
          /* ── Login view ── */
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <img
              src="/nd-logo.png"
              alt="Next Destiny"
              className="w-40 h-40 rounded-full mb-8 ring-4 ring-primary/30 shadow-lg shadow-primary/20"
            />
            <h1 className="text-4xl font-bold mb-2 font-heading text-foreground tracking-tight">
              Next Destiny
            </h1>
            <p className="text-lg text-primary font-heading font-semibold tracking-wide uppercase mb-2">
              BattlePlanner
            </p>
            <p className="text-muted-foreground text-center max-w-md mb-10">
              Taktische Strategieplanung für Rainbow Six Siege.
              Zeichne Taktiken, teile Pläne und koordiniere dich mit deinem Team in Echtzeit.
            </p>
            <button
              onClick={handleDiscordLogin}
              className="gaming-btn px-10 py-3.5 rounded-lg bg-[#5865F2] text-white font-semibold tracking-wide text-sm hover:bg-[#4752C4] transition-all inline-flex items-center gap-3 shadow-lg shadow-[#5865F2]/25"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.947 2.418-2.157 2.418z"/>
              </svg>
              Mit Discord anmelden
            </button>
          </div>
        ) : !activeTeamId ? (
          /* ── Authenticated but no team selected ── */
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <img
              src="/nd-logo.png"
              alt="Next Destiny"
              className="w-28 h-28 rounded-full mb-6 ring-4 ring-primary/30"
            />
            <h1 className="text-3xl font-bold mb-4 font-heading text-foreground">Willkommen zurück!</h1>
            <p className="text-muted-foreground mb-8">Wähle dein Team um fortzufahren.</p>
            <Link
              to="/teams"
              className="gaming-btn px-8 py-3 rounded-lg bg-primary text-primary-foreground font-semibold tracking-wide text-sm hover:brightness-110 transition-all inline-flex items-center gap-2"
            >
              <Users className="h-5 w-5" />
              Team auswählen
            </Link>
          </div>
        ) : (
          /* ── Authenticated with team — game selection ── */
          <>
            <div className="text-center mb-12">
              <h1 className="text-3xl font-bold mb-2 font-heading text-foreground">Wähle ein Spiel</h1>
              <p className="text-muted-foreground">Erstelle Pläne und Räume für dein Team.</p>
            </div>
            {isLoading ? (
              <div className="flex flex-wrap justify-center gap-6">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-48 w-full md:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)]" />)}
              </div>
            ) : (
              <div className="flex flex-wrap justify-center gap-6">
                {data?.data?.map((game) => (
                  <Link key={game.id} to={`/${game.slug}`} className="w-full md:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)]">
                    <div className="gaming-card">
                      <div className="gaming-card-corners">
                        <Card className="hover:border-primary/40 transition-all cursor-pointer h-full border-primary/10 bg-card/80">
                          <CardHeader className="flex flex-row items-center gap-4">
                            {game.icon ? (
                              <img src={`/uploads${game.icon}`} className="h-16 w-16 rounded-lg" alt="" />
                            ) : (
                              <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center">
                                <Gamepad2 className="h-8 w-8 text-muted-foreground" />
                              </div>
                            )}
                            <div>
                              <CardTitle className="text-xl">{game.name}</CardTitle>
                              {game.description && <p className="text-sm text-muted-foreground mt-1">{game.description}</p>}
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center text-primary text-sm font-medium tracking-wide">
                              Maps ansehen <ArrowRight className="ml-1 h-4 w-4" />
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
