import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { apiGet, apiPost } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Eye, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { toast } from 'sonner';

interface PublicPlan {
  id: string; name: string; description: string | null; tags: string[]; isPublic: boolean;
  ownerId: string; gameId: string; mapId: string; createdAt: string;
}

export default function PublicPlansPage() {
  const { gameSlug } = useParams<{ gameSlug: string }>();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [filterTag, setFilterTag] = useState<string>('');
  const filterTags = [
    { value: 'Aggressive', label: t('plans.suggestedTags.aggressive') },
    { value: 'Default', label: t('plans.suggestedTags.default') },
    { value: 'Retake', label: t('plans.suggestedTags.retake') },
    { value: 'Rush', label: t('plans.suggestedTags.rush') },
    { value: 'Anchor', label: t('plans.suggestedTags.anchor') },
    { value: 'Roam', label: t('plans.suggestedTags.roam') },
    { value: 'Site A', label: t('plans.suggestedTags.siteA') },
    { value: 'Site B', label: t('plans.suggestedTags.siteB') },
  ];

  const { data } = useQuery({
    queryKey: ['battleplans', 'public', filterTag],
    queryFn: () => apiGet<{ data: PublicPlan[] }>(`/battleplans${filterTag ? `?tags=${encodeURIComponent(filterTag)}` : ''}`),
  });

  const handleVote = async (planId: string, value: number) => {
    try {
      await apiPost(`/battleplans/${planId}/vote`, { value });
      queryClient.invalidateQueries({ queryKey: ['battleplans'] });
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" asChild><Link to={`/${gameSlug}`}><ArrowLeft className="h-4 w-4" /></Link></Button>
        <h1 className="text-3xl font-bold font-heading">{t('plans.publicTitle')}</h1>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-6">
        <span className="text-sm text-muted-foreground">{t('plans.filter')}</span>
        <Badge variant={filterTag === '' ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setFilterTag('')}>{t('plans.all')}</Badge>
        {filterTags.map((tag) => (
          <Badge key={tag.value} variant={filterTag === tag.value ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setFilterTag(filterTag === tag.value ? '' : tag.value)}>{tag.label}</Badge>
        ))}
      </div>

      {data?.data.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">{t('plans.noPublicPlans')}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.data.map((plan) => (
            <Card key={plan.id}>
              <CardHeader>
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                {plan.description && <p className="text-sm text-muted-foreground">{plan.description}</p>}
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
    </div>
  );
}
