import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { apiGet, apiPost, apiDelete } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ArrowLeft, Plus, FileText, Globe, Eye, Share2, Trash2, Pencil, ThumbsUp, ThumbsDown, Search } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';

const SUGGESTED_TAGS = ['Aggressive', 'Default', 'Retake', 'Rush', 'Anchor', 'Roam', 'Site A', 'Site B'];
const FILTER_TAGS = SUGGESTED_TAGS;

interface GameWithMaps {
  id: string; name: string; slug: string; icon: string | null; description: string | null;
  maps: Array<{ id: string; name: string; slug: string; thumbnail: string | null; isCompetitive: boolean }>;
}

interface Battleplan {
  id: string; name: string; description: string | null; tags: string[]; isPublic: boolean;
  ownerId: string; gameId: string; mapId: string; createdAt: string; updatedAt: string;
}

export default function GameDashboard() {
  const { gameSlug } = useParams<{ gameSlug: string }>();
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'my' | 'public'>('my');
  const [filterTag, setFilterTag] = useState('');
  const [filterMapId, setFilterMapId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['game', gameSlug],
    queryFn: () => apiGet<{ data: GameWithMaps }>(`/games/${gameSlug}`),
  });

  const { data: myPlansData } = useQuery({
    queryKey: ['battleplans', 'mine'],
    queryFn: () => apiGet<{ data: Battleplan[] }>('/battleplans/mine'),
    enabled: isAuthenticated,
  });

  const { data: publicPlansData } = useQuery({
    queryKey: ['battleplans', 'public', filterTag],
    queryFn: () => apiGet<{ data: Battleplan[] }>(`/battleplans${filterTag ? `?tags=${encodeURIComponent(filterTag)}` : ''}`),
  });

  const game = data?.data;
  const allMyPlans = myPlansData?.data.filter(p => p.gameId === game?.id) || [];
  const publicPlans = publicPlansData?.data.filter(p => p.gameId === game?.id) || [];

  // Filter my plans by map, tag, and search query
  const myPlans = useMemo(() => {
    let filtered = allMyPlans;
    if (filterMapId) filtered = filtered.filter(p => p.mapId === filterMapId);
    if (filterTag) filtered = filtered.filter(p => p.tags?.includes(filterTag));
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q));
    }
    return filtered;
  }, [allMyPlans, filterMapId, filterTag, searchQuery]);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiDelete(`/battleplans/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['battleplans'] });
      toast.success(t('plans.planDeleted'));
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleVote = async (planId: string, value: number) => {
    try {
      await apiPost(`/battleplans/${planId}/vote`, { value });
      queryClient.invalidateQueries({ queryKey: ['battleplans'] });
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleEditPlan = async (planId: string) => {
    try {
      const res = await apiPost<{ data: { connectionString: string } }>('/rooms', { battleplanId: planId });
      navigate(`/room/${res.data.connectionString}`);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (isLoading) return <div className="container mx-auto p-8"><Skeleton className="h-64" /></div>;
  if (!game) return <div className="container mx-auto p-8 text-center text-muted-foreground">{t('game.notFound')}</div>;

  return (
    <div className="container mx-auto px-6 py-12 relative max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-5">
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

        {/* Create Room button */}
        {isAuthenticated && (
          <Link
            to={`/room/create?game=${gameSlug}`}
            className="px-5 py-2.5 rounded-lg border border-primary/30 text-foreground font-medium tracking-wide uppercase text-sm hover:border-primary/60 hover:bg-primary/5 transition-all inline-flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> {t('game.createRoom')}
          </Link>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 border-b border-border">
        {isAuthenticated && (
          <button
            onClick={() => setActiveTab('my')}
            className={`px-5 py-3 text-sm font-semibold tracking-wide uppercase transition-colors relative ${
              activeTab === 'my'
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span className="flex items-center gap-2"><FileText className="h-4 w-4" /> {t('game.myPlans')}</span>
            {activeTab === 'my' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
          </button>
        )}
        <button
          onClick={() => setActiveTab('public')}
          className={`px-5 py-3 text-sm font-semibold tracking-wide uppercase transition-colors relative ${
            activeTab === 'public'
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <span className="flex items-center gap-2"><Globe className="h-4 w-4" /> {t('game.publicPlans')}</span>
          {activeTab === 'public' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
        </button>
      </div>

      {/* Tab content: My Plans */}
      {activeTab === 'my' && isAuthenticated && (
        <>
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
            <Select value={filterMapId} onValueChange={(v) => setFilterMapId(v === 'all' ? '' : v)}>
              <SelectTrigger className="w-48"><SelectValue placeholder={t('plans.allMaps')} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('plans.allMaps')}</SelectItem>
                {game.maps.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <div className="flex flex-wrap items-center gap-1">
              <Badge variant={filterTag === '' ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setFilterTag('')}>{t('plans.all')}</Badge>
              {FILTER_TAGS.map((tag) => (
                <Badge key={tag} variant={filterTag === tag ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setFilterTag(filterTag === tag ? '' : tag)}>{tag}</Badge>
              ))}
            </div>
          </div>

          {myPlans.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <p className="text-lg">{allMyPlans.length === 0 ? t('plans.noPlansYet') : t('plans.noFilterResults')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myPlans.map((plan) => {
                const mapName = game.maps.find(m => m.id === plan.mapId)?.name;
                return (
                  <Card key={plan.id} className="hover:border-primary/40 transition-colors">
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
        </>
      )}

      {/* Tab content: Public Plans */}
      {activeTab === 'public' && (
        <>
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-sm text-muted-foreground">{t('plans.filter')}</span>
            <Badge variant={filterTag === '' ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setFilterTag('')}>{t('plans.all')}</Badge>
            {FILTER_TAGS.map((tag) => (
              <Badge key={tag} variant={filterTag === tag ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setFilterTag(filterTag === tag ? '' : tag)}>{tag}</Badge>
            ))}
          </div>

          {publicPlans.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">{t('plans.noPublicPlans')}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {publicPlans.map((plan) => (
                <Card key={plan.id} className="hover:border-primary/40 transition-colors">
                  <CardHeader>
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    {plan.description && <p className="text-sm text-muted-foreground line-clamp-2">{plan.description}</p>}
                    {plan.tags?.length > 0 && <div className="flex flex-wrap gap-1 mt-1">{plan.tags.map((tag: string) => <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>)}</div>}
                  </CardHeader>
                  <CardContent className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild><Link to={`/${gameSlug}/plans/${plan.id}`}><Eye className="mr-1 h-3 w-3" /> {t('plans.view')}</Link></Button>
                    {isAuthenticated && (
                      <>
                        <Button variant="ghost" size="sm" onClick={() => handleVote(plan.id, 1)}><ThumbsUp className="h-3 w-3" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => handleVote(plan.id, -1)}><ThumbsDown className="h-3 w-3" /></Button>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
