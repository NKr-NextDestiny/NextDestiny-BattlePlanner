import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { apiGet, apiPost, apiDelete } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Trash2, Eye, ArrowLeft, Share2, X } from 'lucide-react';
import { useState } from 'react';

const SUGGESTED_TAGS = ['Aggressive', 'Default', 'Retake', 'Rush', 'Anchor', 'Roam', 'Site A', 'Site B'];

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
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMapId, setSelectedMapId] = useState('');
  const [newTags, setNewTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const { data: gameData } = useQuery({ queryKey: ['game', gameSlug], queryFn: () => apiGet<{ data: GameWithMaps }>(`/games/${gameSlug}`) });
  const { data: plansData } = useQuery({ queryKey: ['battleplans', 'mine'], queryFn: () => apiGet<{ data: Battleplan[] }>('/battleplans/mine') });

  const game = gameData?.data;
  const plans = plansData?.data.filter(p => p.gameId === game?.id) || [];

  const createMutation = useMutation({
    mutationFn: (data: { gameId: string; mapId: string; name: string; description?: string; tags?: string[] }) => apiPost<{ data: Battleplan }>('/battleplans', data),
    onSuccess: (res) => { queryClient.invalidateQueries({ queryKey: ['battleplans'] }); toast.success(t('plans.planCreated')); setIsOpen(false); setNewTags([]); setTagInput(''); navigate(`/${gameSlug}/plans/${res.data.id}`); },
    onError: (err: Error) => toast.error(err.message),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiDelete(`/battleplans/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['battleplans'] }); toast.success(t('plans.planDeleted')); },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    createMutation.mutate({ gameId: game!.id, mapId: selectedMapId, name: form.get('name') as string, description: (form.get('description') as string)?.trim() || undefined, tags: newTags.length > 0 ? newTags : undefined });
  };

  const addTag = (tag: string) => { const trimmed = tag.trim(); if (trimmed && !newTags.includes(trimmed) && newTags.length < 10) setNewTags(prev => [...prev, trimmed]); setTagInput(''); };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild><Link to={`/${gameSlug}`}><ArrowLeft className="h-4 w-4" /></Link></Button>
          <h1 className="text-3xl font-bold font-heading">{t('plans.myTitle')}</h1>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> {t('plans.newPlan')}</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{t('plans.createPlan')}</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2"><Label>{t('plans.name')}</Label><Input name="name" required /></div>
              <div className="space-y-2"><Label>{t('plans.description')}</Label><Textarea name="description" placeholder={t('plans.descriptionPlaceholder')} rows={3} /></div>
              <div className="space-y-2">
                <Label>{t('plans.map')}</Label>
                <Select value={selectedMapId} onValueChange={setSelectedMapId}>
                  <SelectTrigger><SelectValue placeholder={t('plans.selectMap')} /></SelectTrigger>
                  <SelectContent>{game?.maps.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('plans.tags')}</Label>
                {newTags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {newTags.map((tag) => <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => setNewTags(tags => tags.filter(x => x !== tag))}>{tag} <X className="h-2 w-2 ml-1" /></Badge>)}
                  </div>
                )}
                <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && tagInput.trim()) { e.preventDefault(); addTag(tagInput); } }} placeholder={t('plans.tagPlaceholder')} />
                <div className="flex flex-wrap gap-1">
                  {SUGGESTED_TAGS.filter(tg => !newTags.includes(tg)).map((tag) => <Badge key={tag} variant="outline" className="cursor-pointer text-xs" onClick={() => addTag(tag)}>+ {tag}</Badge>)}
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild><Button variant="outline">{t('plans.cancel')}</Button></DialogClose>
                <Button type="submit" disabled={!selectedMapId}>{t('plans.create')}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {plans.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground"><p className="text-lg">{t('plans.noPlansYet')}</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <Card key={plan.id} className="hover:border-primary transition-colors">
              <CardHeader>
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                {plan.description && <p className="text-sm text-muted-foreground line-clamp-2">{plan.description}</p>}
                {plan.tags?.length > 0 && <div className="flex flex-wrap gap-1 mt-1">{plan.tags.map((tag: string) => <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>)}</div>}
                <p className="text-sm text-muted-foreground">{new Date(plan.updatedAt).toLocaleDateString()}</p>
              </CardHeader>
              <CardContent className="flex gap-2">
                <Button variant="outline" size="sm" asChild><Link to={`/${gameSlug}/plans/${plan.id}`}><Eye className="mr-1 h-3 w-3" /> {t('plans.view')}</Link></Button>
                <Button variant="ghost" size="sm" onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/${gameSlug}/plans/${plan.id}`); toast.success(t('plans.linkCopied')); }}><Share2 className="h-3 w-3" /></Button>
                <Button variant="ghost" size="sm" onClick={() => { if (confirm(t('plans.confirmDelete'))) deleteMutation.mutate(plan.id); }}><Trash2 className="h-3 w-3 text-destructive" /></Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
