import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link, useNavigate } from 'react-router-dom';
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

interface MapData {
  id: string; name: string; slug: string;
}

interface GameWithMaps {
  id: string; name: string; maps: MapData[];
}

export default function MyPlansPage() {
  const { gameSlug } = useParams<{ gameSlug: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMapId, setSelectedMapId] = useState('');
  const [newTags, setNewTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const { data: gameData } = useQuery({
    queryKey: ['game', gameSlug],
    queryFn: () => apiGet<{ data: GameWithMaps }>(`/games/${gameSlug}`),
  });

  const { data: plansData } = useQuery({
    queryKey: ['battleplans', 'mine'],
    queryFn: () => apiGet<{ data: Battleplan[] }>('/battleplans/mine'),
  });

  const game = gameData?.data;
  const plans = plansData?.data.filter(p => p.gameId === game?.id) || [];

  const createMutation = useMutation({
    mutationFn: (data: { gameId: string; mapId: string; name: string; description?: string; tags?: string[] }) => apiPost<{ data: Battleplan }>('/battleplans', data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['battleplans'] });
      toast.success('Battleplan created');
      setIsOpen(false);
      setNewTags([]);
      setTagInput('');
      navigate(`/${gameSlug}/plans/${res.data.id}`);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiDelete(`/battleplans/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['battleplans'] }); toast.success('Battleplan deleted'); },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const description = (form.get('description') as string)?.trim() || undefined;
    createMutation.mutate({
      gameId: game!.id,
      mapId: selectedMapId,
      name: form.get('name') as string,
      description,
      tags: newTags.length > 0 ? newTags : undefined,
    });
  };

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !newTags.includes(trimmed) && newTags.length < 10) {
      setNewTags(prev => [...prev, trimmed]);
    }
    setTagInput('');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild><Link to={`/${gameSlug}`}><ArrowLeft className="h-4 w-4" /></Link></Button>
          <h1 className="text-3xl font-bold">My Battle Plans</h1>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> New Plan</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Battle Plan</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2"><Label>Name</Label><Input name="name" required /></div>
              <div className="space-y-2"><Label>Description (optional)</Label><Textarea name="description" placeholder="Brief description of this battleplan..." rows={3} /></div>
              <div className="space-y-2">
                <Label>Map</Label>
                <Select value={selectedMapId} onValueChange={setSelectedMapId}>
                  <SelectTrigger><SelectValue placeholder="Select a map" /></SelectTrigger>
                  <SelectContent>
                    {game?.maps.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tags</Label>
                {newTags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {newTags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => setNewTags(t => t.filter(x => x !== tag))}>
                        {tag} <X className="h-2 w-2 ml-1" />
                      </Badge>
                    ))}
                  </div>
                )}
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && tagInput.trim()) { e.preventDefault(); addTag(tagInput); } }}
                  placeholder="Add tag and press Enter"
                />
                <div className="flex flex-wrap gap-1">
                  {SUGGESTED_TAGS.filter(t => !newTags.includes(t)).map((tag) => (
                    <Badge key={tag} variant="outline" className="cursor-pointer text-xs" onClick={() => addTag(tag)}>
                      + {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                <Button type="submit" disabled={!selectedMapId}>Create</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {plans.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg">No battle plans yet. Create your first one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <Card key={plan.id} className="hover:border-primary transition-colors">
              <CardHeader>
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                {plan.description && <p className="text-sm text-muted-foreground line-clamp-2">{plan.description}</p>}
                {plan.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {plan.tags.map((tag: string) => (
                      <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                )}
                <p className="text-sm text-muted-foreground">
                  {new Date(plan.updatedAt).toLocaleDateString()}
                </p>
              </CardHeader>
              <CardContent className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/${gameSlug}/plans/${plan.id}`}><Eye className="mr-1 h-3 w-3" /> View</Link>
                </Button>
                <Button variant="ghost" size="sm" onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/${gameSlug}/plans/${plan.id}`);
                  toast.success('Link copied!');
                }}>
                  <Share2 className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => { if (confirm('Delete?')) deleteMutation.mutate(plan.id); }}>
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
