import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { apiGet, apiPost } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { ArrowLeft, Users, Gamepad2, Search } from 'lucide-react';

interface Game {
  id: string; name: string; slug: string; icon: string | null;
}

interface MapData {
  id: string; name: string; slug: string; thumbnail: string | null;
}

interface GameWithMaps extends Game {
  maps: MapData[];
}

export default function CreateRoomPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'game' | 'map' | 'confirm'>('game');
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [selectedMap, setSelectedMap] = useState<MapData | null>(null);
  const [mapSearch, setMapSearch] = useState('');

  const { data: gamesData, isLoading: gamesLoading } = useQuery({
    queryKey: ['games'],
    queryFn: () => apiGet<{ data: Game[] }>('/games'),
  });

  const { data: gameDetailData } = useQuery({
    queryKey: ['game', selectedGame?.slug],
    queryFn: () => apiGet<{ data: GameWithMaps }>(`/games/${selectedGame!.slug}`),
    enabled: !!selectedGame?.slug,
  });

  const createMutation = useMutation({
    mutationFn: (data: { gameId: string; mapId: string }) =>
      apiPost<{ data: { connectionString: string } }>('/rooms', data),
    onSuccess: (res) => {
      navigate(`/room/${res.data.connectionString}`);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleSelectGame = (game: Game) => {
    setSelectedGame(game);
    setStep('map');
  };

  const handleSelectMap = (map: MapData) => {
    setSelectedMap(map);
    setStep('confirm');
  };

  const handleCreate = () => {
    if (!selectedGame || !selectedMap) return;
    createMutation.mutate({ gameId: selectedGame.id, mapId: selectedMap.id });
  };

  // Step 3: Confirm
  if (step === 'confirm' && selectedGame && selectedMap) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => setStep('map')}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <h1 className="text-3xl font-bold">Create Room</h1>
        </div>

        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" /> New Collaboration Room
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Game</span>
                <span className="font-medium">{selectedGame.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Map</span>
                <span className="font-medium">{selectedMap.name}</span>
              </div>
              <Button onClick={handleCreate} disabled={createMutation.isPending} className="w-full">
                {createMutation.isPending ? 'Creating...' : 'Create Room'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Step 2: Map selection
  if (step === 'map' && selectedGame) {
    const allMaps = gameDetailData?.data?.maps || [];
    const maps = mapSearch
      ? allMaps.filter((m) => m.name.toLowerCase().includes(mapSearch.toLowerCase()))
      : allMaps;
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => { setStep('game'); setSelectedGame(null); setMapSearch(''); }}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <h1 className="text-3xl font-bold">{selectedGame.name} — Choose a Map</h1>
        </div>

        <div className="relative max-w-sm mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search maps..."
            value={mapSearch}
            onChange={(e) => setMapSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {maps.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p>{allMaps.length === 0 ? 'No maps available for this game.' : 'No maps match your search.'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {maps.map((map) => (
              <Card key={map.id} className="hover:border-primary transition-colors cursor-pointer" onClick={() => handleSelectMap(map)}>
                <CardHeader>
                  {map.thumbnail ? (
                    <img src={`/uploads${map.thumbnail}`} className="w-full h-32 object-cover rounded" alt="" />
                  ) : (
                    <div className="w-full h-32 bg-muted rounded flex items-center justify-center text-muted-foreground">No preview</div>
                  )}
                </CardHeader>
                <CardContent><CardTitle className="text-lg">{map.name}</CardTitle></CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Step 1: Game selection
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Create Room — Choose a Game</h1>
      {gamesLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gamesData?.data.map((game) => (
            <Card key={game.id} className="hover:border-primary transition-colors cursor-pointer" onClick={() => handleSelectGame(game)}>
              <CardHeader className="flex flex-row items-center gap-4">
                {game.icon ? (
                  <img src={`/uploads${game.icon}`} className="h-16 w-16 rounded-lg" alt="" />
                ) : (
                  <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center">
                    <Gamepad2 className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <CardTitle className="text-xl">{game.name}</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
