import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { apiGet, apiPut } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Settings {
  adminDiscordRoleIds: string[];
  adminDiscordUserIds: string[];
}

function arrToStr(arr: string[]): string {
  return arr.filter(Boolean).join(', ');
}

function strToArr(str: string): string[] {
  return str.split(',').map((s) => s.trim()).filter(Boolean);
}

export default function SettingsPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [roleIds, setRoleIds] = useState('');
  const [userIds, setUserIds] = useState('');
  const [loaded, setLoaded] = useState(false);

  const { data } = useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: () => apiGet<{ data: Settings }>('/admin/settings'),
  });

  if (data && !loaded) {
    setRoleIds(arrToStr(data.data.adminDiscordRoleIds || []));
    setUserIds(arrToStr(data.data.adminDiscordUserIds || []));
    setLoaded(true);
  }

  const updateMutation = useMutation({
    mutationFn: (settings: { adminDiscordRoleIds: string[]; adminDiscordUserIds: string[] }) =>
      apiPut('/admin/settings', settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'settings'] });
      toast.success(t('adminSettings.updated'));
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleSave = () => {
    updateMutation.mutate({
      adminDiscordRoleIds: strToArr(roleIds),
      adminDiscordUserIds: strToArr(userIds),
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t('adminSettings.title')}</h1>

      <Card>
        <CardHeader>
          <CardTitle>{t('adminSettings.adminAccess')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t('adminSettings.description')}
          </p>
          <div className="space-y-2">
            <Label>{t('adminSettings.roleIds')}</Label>
            <Input
              value={roleIds}
              onChange={(e) => setRoleIds(e.target.value)}
              placeholder={t('adminSettings.roleIdsPlaceholder')}
            />
            <p className="text-xs text-muted-foreground">
              {t('adminSettings.roleIdsHelp')}
            </p>
          </div>
          <div className="space-y-2">
            <Label>{t('adminSettings.userIds')}</Label>
            <Input
              value={userIds}
              onChange={(e) => setUserIds(e.target.value)}
              placeholder={t('adminSettings.userIdsPlaceholder')}
            />
            <p className="text-xs text-muted-foreground">
              {t('adminSettings.userIdsHelp')}
            </p>
          </div>
          <Button onClick={handleSave} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? t('adminSettings.saving') : t('adminSettings.save')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
