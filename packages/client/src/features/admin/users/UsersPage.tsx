import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Shield, Trash2, LogOut } from 'lucide-react';

interface UserData {
  id: string; username: string; discordUsername: string; discordId: string;
  role: string; createdAt: string;
}

export default function UsersPage() {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((s) => s.user);

  const { data } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => apiGet<{ data: UserData[]; total: number }>('/admin/users'),
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) => apiPut(`/admin/users/${id}/role`, { role }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }); toast.success('Role updated'); },
    onError: (err: Error) => toast.error(err.message),
  });

  const kickMutation = useMutation({
    mutationFn: (id: string) => apiPost(`/admin/users/${id}/kick`),
    onSuccess: () => toast.success('User session revoked'),
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiDelete(`/admin/users/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }); toast.success('User deleted'); },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Users</h1>

      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left font-medium text-muted-foreground p-4">Username</th>
              <th className="text-left font-medium text-muted-foreground p-4">Discord</th>
              <th className="text-left font-medium text-muted-foreground p-4">Discord ID</th>
              <th className="text-left font-medium text-muted-foreground p-4">Role</th>
              <th className="text-left font-medium text-muted-foreground p-4">Joined</th>
              <th className="text-right font-medium text-muted-foreground p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.data.map((user) => {
              const isSelf = user.id === currentUser?.id;
              return (
                <tr key={user.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="p-4 font-medium">
                    {user.username}
                    {isSelf && <span className="ml-2 text-xs text-muted-foreground">(you)</span>}
                  </td>
                  <td className="p-4 text-muted-foreground">{user.discordUsername}</td>
                  <td className="p-4">
                    <code className="bg-secondary px-1.5 py-0.5 rounded text-xs">{user.discordId}</code>
                  </td>
                  <td className="p-4">
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>{user.role}</Badge>
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-1">
                      {!isSelf && (
                        <>
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="Kick (force logout)" onClick={() => { if (confirm(`Kick "${user.username}"? Their session will be revoked.`)) kickMutation.mutate(user.id); }}>
                            <LogOut className="h-4 w-4 text-amber-500" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="Toggle role" onClick={() => {
                            const newRole = user.role === 'admin' ? 'user' : 'admin';
                            roleMutation.mutate({ id: user.id, role: newRole });
                          }}>
                            <Shield className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="Delete user" onClick={() => { if (confirm('Permanently delete this user and all their data?')) deleteMutation.mutate(user.id); }}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {data?.data.length === 0 && (
          <p className="p-4 text-center text-muted-foreground">No users found</p>
        )}
      </div>
    </div>
  );
}
