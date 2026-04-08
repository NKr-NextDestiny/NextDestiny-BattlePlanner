import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { apiGet } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Map, FileText, Globe, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';

interface GameWithMaps {
  id: string; name: string; slug: string; icon: string | null; description: string | null;
  maps: Array<{ id: string; name: string; slug: string; thumbnail: string | null; isCompetitive: boolean }>;
}

export default function GameDashboard() {
  const { gameSlug } = useParams<{ gameSlug: string }>();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const { data, isLoading } = useQuery({
    queryKey: ['game', gameSlug],
    queryFn: () => apiGet<{ data: GameWithMaps }>(`/games/${gameSlug}`),
  });

  const game = data?.data;

  if (isLoading) return <div className="container mx-auto p-8"><Skeleton className="h-64" /></div>;
  if (!game) return <div className="container mx-auto p-8 text-center text-muted-foreground">Game not found</div>;

  return (
    <div className="container mx-auto px-6 py-12 relative max-w-7xl">
      <div className="flex items-center gap-5 mb-10">
        <Link to="/" className="text-muted-foreground hover:text-primary transition-colors"><ArrowLeft className="h-5 w-5" /></Link>
        <div className="flex items-center gap-4">
          {game.icon && (
            <img
              src={`/uploads${game.icon}`}
              className="h-16 w-16 rounded-lg drop-shadow-[0_0_12px_oklch(0.68_0.19_45/0.4)]"
              alt=""
            />
          )}
          <div>
            <h1 className="text-3xl font-bold tracking-wide">{game.name}</h1>
            {game.description && <p className="text-muted-foreground">{game.description}</p>}
          </div>
        </div>
      </div>

      <div className="flex gap-3 mb-8">
        {isAuthenticated && (
          <Link to={`/${gameSlug}/plans`} className="gaming-btn px-5 py-2 rounded-lg bg-primary text-primary-foreground font-semibold tracking-wide uppercase text-sm hover:brightness-110 transition-all inline-flex items-center gap-2">
            <FileText className="h-4 w-4" /> My Plans
          </Link>
        )}
        <Link to={`/${gameSlug}/plans/public`} className="px-5 py-2 rounded-lg border border-primary/30 text-foreground font-medium tracking-wide uppercase text-sm hover:border-primary/60 hover:bg-primary/5 transition-all inline-flex items-center gap-2">
          <Globe className="h-4 w-4" /> Public Plans
        </Link>
      </div>

      <h2 className="text-xs font-bold mb-4 tracking-wider uppercase text-muted-foreground">Maps</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-8">
        {game.maps.map((map) => (
          <div key={map.id} className="gaming-card">
            <div className="gaming-card-corners">
              <Card className="overflow-hidden hover:border-primary/40 transition-all border-primary/10 bg-card/80">
                {map.thumbnail ? (
                  <img src={`/uploads${map.thumbnail}`} className="w-full h-40 object-cover" alt={map.name} />
                ) : (
                  <div className="w-full h-40 bg-muted flex items-center justify-center">
                    <Map className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                <CardContent className="p-4">
                  <h3 className="font-semibold">{map.name}</h3>
                </CardContent>
              </Card>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
