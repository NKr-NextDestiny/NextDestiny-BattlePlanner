import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPut } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Settings {
  adminDiscordRoleIds: string;
  adminDiscordUserIds: string;
}

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [roleIds, setRoleIds] = useState('');
  const [userIds, setUserIds] = useState('');
  const [loaded, setLoaded] = useState(false);

  const { data } = useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: () => apiGet<{ data: Settings }>('/admin/settings'),
  });

  if (data && !loaded) {
    setRoleIds(data.data.adminDiscordRoleIds || '');
    setUserIds(data.data.adminDiscordUserIds || '');
    setLoaded(true);
  }

  const updateMutation = useMutation({
    mutationFn: (settings: Partial<Settings>) => apiPut('/admin/settings', settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'settings'] });
      toast.success('Settings updated');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleSave = () => {
    updateMutation.mutate({
      adminDiscordRoleIds: roleIds,
      adminDiscordUserIds: userIds,
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Admin Access</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Users with these Discord role IDs or user IDs will have admin access, in addition to users with the admin role in the database.
          </p>
          <div className="space-y-2">
            <Label>Admin Discord Role IDs</Label>
            <Input
              value={roleIds}
              onChange={(e) => setRoleIds(e.target.value)}
              placeholder="Comma-separated role IDs, e.g. 123456789,987654321"
            />
            <p className="text-xs text-muted-foreground">
              Discord role IDs that grant admin access. Separate multiple IDs with commas.
            </p>
          </div>
          <div className="space-y-2">
            <Label>Admin Discord User IDs</Label>
            <Input
              value={userIds}
              onChange={(e) => setUserIds(e.target.value)}
              placeholder="Comma-separated user IDs, e.g. 123456789,987654321"
            />
            <p className="text-xs text-muted-foreground">
              Individual Discord user IDs that grant admin access. Separate multiple IDs with commas.
            </p>
          </div>
          <Button onClick={handleSave} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? 'Saving...' : 'Save Settings'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
