import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { apiGet, apiPost, apiDelete } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Trash2, Eye, ArrowLeft, Share2, Pencil, Search } from 'lucide-react';

const FILTER_TAGS = ['Aggressive', 'Default', 'Retake', 'Rush', 'Anchor', 'Roam', 'Site A', 'Site B'];

interface Battleplan {
  id: string; name: string; description: string | null; tags: string[]; isPublic: boolean;
  gameId: string; mapId: string; createdAt: string; updatedAt: string;
}
interface MapData { id: string; name: string; slug: string; }
interface GameWithMaps { id: string; name: string; maps: MapData[]; }

export default function MyPlansPage() {
  const { gameSlug } = useParams<{ gameSlug: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [filterTag, setFilterTag] = useState('');
  const [filterMapId, setFilterMapId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: gameData } = useQuery({ queryKey: ['game', gameSlug], queryFn: () => apiGet<{ data: GameWithMaps }>(`/games/${gameSlug}`) });
  const { data: plansData } = useQuery({ queryKey: ['battleplans', 'mine'], queryFn: () => apiGet<{ data: Battleplan[] }>('/battleplans/mine') });

  const game = gameData?.data;
  const allPlans = plansData?.data.filter(p => p.gameId === game?.id) || [];

  const plans = useMemo(() => {
    let filtered = allPlans;
    if (filterMapId) filtered = filtered.filter(p => p.mapId === filterMapId);
    if (filterTag) filtered = filtered.filter(p => p.tags?.includes(filterTag));
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q));
    }
    return filtered;
  }, [allPlans, filterMapId, filterTag, searchQuery]);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiDelete(`/battleplans/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['battleplans'] }); toast.success(t('plans.planDeleted')); },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleEditPlan = async (planId: string) => {
    try {
      const res = await apiPost<{ data: { connectionString: string } }>('/rooms', { battleplanId: planId });
      navigate(`/room/${res.data.connectionString}`);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild><Link to={`/${gameSlug}`}><ArrowLeft className="h-4 w-4" /></Link></Button>
          <h1 className="text-3xl font-bold font-heading">{t('plans.myTitle')}</h1>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('plans.searchPlans')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 w-56"
          />
        </div>
        {game && (
          <Select value={filterMapId} onValueChange={(v) => setFilterMapId(v === 'all' ? '' : v)}>
            <SelectTrigger className="w-48"><SelectValue placeholder={t('plans.allMaps')} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('plans.allMaps')}</SelectItem>
              {game.maps.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
        <div className="flex flex-wrap items-center gap-1">
          <Badge variant={filterTag === '' ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setFilterTag('')}>{t('plans.all')}</Badge>
          {FILTER_TAGS.map((tag) => (
            <Badge key={tag} variant={filterTag === tag ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setFilterTag(filterTag === tag ? '' : tag)}>{tag}</Badge>
          ))}
        </div>
      </div>

      {plans.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg">{allPlans.length === 0 ? t('plans.noPlansYet') : t('plans.noFilterResults')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((plan) => {
            const mapName = game?.maps.find(m => m.id === plan.mapId)?.name;
            return (
              <Card key={plan.id} className="hover:border-primary transition-colors">
                <CardHeader>
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  {mapName && <p className="text-xs text-primary/70">{mapName}</p>}
                  {plan.description && <p className="text-sm text-muted-foreground line-clamp-2">{plan.description}</p>}
                  {plan.tags?.length > 0 && <div className="flex flex-wrap gap-1 mt-1">{plan.tags.map((tag: string) => <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>)}</div>}
                  <p className="text-sm text-muted-foreground">{new Date(plan.updatedAt).toLocaleDateString()}</p>
                </CardHeader>
                <CardContent className="flex gap-2">
                  <Button variant="outline" size="sm" asChild><Link to={`/${gameSlug}/plans/${plan.id}`}><Eye className="mr-1 h-3 w-3" /> {t('plans.view')}</Link></Button>
                  <Button variant="outline" size="sm" onClick={() => handleEditPlan(plan.id)}><Pencil className="mr-1 h-3 w-3" /> {t('plans.edit')}</Button>
                  <Button variant="ghost" size="sm" onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/${gameSlug}/plans/${plan.id}`); toast.success(t('plans.linkCopied')); }}><Share2 className="h-3 w-3" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => { if (confirm(t('plans.confirmDelete'))) deleteMutation.mutate(plan.id); }}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
