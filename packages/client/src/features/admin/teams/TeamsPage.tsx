import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { apiGet, apiPost } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Plus, Trash2, Users, UserPlus, AlertTriangle } from 'lucide-react';

interface TeamWithCount {
  id: string; name: string; discordRoleId: string; individualMemberCount: number; createdAt: string;
}
interface TeamMember {
  id: string; teamId: string; discordUserId: string; createdAt: string;
}
interface TeamStats {
  planCount: number; roomCount: number;
}

export default function TeamsPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRoleId, setNewRoleId] = useState('');
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);
  const [newMemberId, setNewMemberId] = useState('');
  const [deleteTeam, setDeleteTeam] = useState<TeamWithCount | null>(null);
  const [deleteMode, setDeleteMode] = useState<'delete' | 'archive' | 'move'>('delete');
  const [moveTargetId, setMoveTargetId] = useState('');

  const { data: teamsData } = useQuery({
    queryKey: ['admin', 'teams'],
    queryFn: () => apiGet<{ data: TeamWithCount[] }>('/admin/teams'),
  });
  const { data: deleteStats } = useQuery({
    queryKey: ['admin', 'teams', deleteTeam?.id, 'stats'],
    queryFn: () => apiGet<{ data: TeamStats }>(`/admin/teams/${deleteTeam!.id}/stats`),
    enabled: !!deleteTeam,
  });

  const createTeam = useMutation({
    mutationFn: () => apiPost('/admin/teams', { name: newName, discordRoleId: newRoleId }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'teams'] }); setShowCreate(false); setNewName(''); setNewRoleId(''); },
  });
  const deleteTeamMutation = useMutation({
    mutationFn: ({ id, mode, targetTeamId }: { id: string; mode: string; targetTeamId?: string }) =>
      apiPost(`/admin/teams/${id}/delete`, { mode, targetTeamId }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'teams'] }); setDeleteTeam(null); setDeleteMode('delete'); setMoveTargetId(''); },
  });

  const teams = teamsData?.data || [];
  const stats = deleteStats?.data;
  const otherTeams = teams.filter((tm) => tm.id !== deleteTeam?.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('admin.teams')}</h1>
        <Button onClick={() => setShowCreate(!showCreate)} size="sm"><Plus className="mr-2 h-4 w-4" />{t('admin.newTeam')}</Button>
      </div>

      {showCreate && (
        <div className="rounded-lg border border-border bg-card p-4 space-y-3">
          <div><Label>{t('admin.teamName')}</Label><Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder={t('admin.teamNamePlaceholder')} /></div>
          <div><Label>{t('admin.discordRoleId')}</Label><Input value={newRoleId} onChange={(e) => setNewRoleId(e.target.value)} placeholder={t('admin.discordRoleIdPlaceholder')} /></div>
          <div className="flex gap-2">
            <Button onClick={() => createTeam.mutate()} disabled={!newName || !newRoleId}>{t('admin.createBtn')}</Button>
            <Button variant="outline" onClick={() => setShowCreate(false)}>{t('admin.cancelBtn')}</Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {teams.map((team) => (
          <div key={team.id} className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold flex items-center gap-2"><Users className="h-4 w-4 text-primary" />{team.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('admin.roleId')}: <code className="bg-secondary px-1 rounded">{team.discordRoleId}</code>
                  {' '}&middot; {team.individualMemberCount} {t('admin.individualMembers')}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setExpandedTeam(expandedTeam === team.id ? null : team.id)}><UserPlus className="h-4 w-4" /></Button>
                <Button variant="destructive" size="sm" onClick={() => { setDeleteTeam(team); setDeleteMode('delete'); setMoveTargetId(''); }}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
            {expandedTeam === team.id && <TeamMembersSection teamId={team.id} newMemberId={newMemberId} setNewMemberId={setNewMemberId} />}
          </div>
        ))}
        {teams.length === 0 && <p className="text-center text-muted-foreground py-8">{t('admin.noTeamsYet')}</p>}
      </div>

      <Dialog open={!!deleteTeam} onOpenChange={(open) => { if (!open) setDeleteTeam(null); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-destructive" />{t('admin.deleteTeamName', { name: deleteTeam?.name })}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {stats && (stats.planCount > 0 || stats.roomCount > 0) ? (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                <p className="text-sm font-medium text-destructive">{t('admin.teamHasContent', { plans: stats.planCount, rooms: stats.roomCount })}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t('admin.teamEmpty')}</p>
            )}
            <div className="space-y-3">
              <Label>{t('admin.whatHappens')}</Label>
              <label className="flex items-start gap-3 p-3 rounded-lg border border-border cursor-pointer hover:bg-muted/50">
                <input type="radio" name="deleteMode" value="delete" checked={deleteMode === 'delete'} onChange={() => setDeleteMode('delete')} className="mt-1" />
                <div><p className="font-medium text-sm">{t('admin.deleteAll')}</p><p className="text-xs text-muted-foreground">{t('admin.deleteAllDesc')}</p></div>
              </label>
              <label className="flex items-start gap-3 p-3 rounded-lg border border-border cursor-pointer hover:bg-muted/50">
                <input type="radio" name="deleteMode" value="archive" checked={deleteMode === 'archive'} onChange={() => setDeleteMode('archive')} className="mt-1" />
                <div><p className="font-medium text-sm">{t('admin.archive')}</p><p className="text-xs text-muted-foreground">{t('admin.archiveDesc')}</p></div>
              </label>
              <label className="flex items-start gap-3 p-3 rounded-lg border border-border cursor-pointer hover:bg-muted/50">
                <input type="radio" name="deleteMode" value="move" checked={deleteMode === 'move'} onChange={() => setDeleteMode('move')} className="mt-1" />
                <div><p className="font-medium text-sm">{t('admin.moveTeam')}</p><p className="text-xs text-muted-foreground">{t('admin.moveTeamDesc')}</p></div>
              </label>
              {deleteMode === 'move' && (
                <Select value={moveTargetId} onValueChange={setMoveTargetId}>
                  <SelectTrigger><SelectValue placeholder={t('admin.selectTarget')} /></SelectTrigger>
                  <SelectContent>{otherTeams.map((tm) => <SelectItem key={tm.id} value={tm.id}>{tm.name}</SelectItem>)}</SelectContent>
                </Select>
              )}
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">{t('admin.cancelBtn')}</Button></DialogClose>
            <Button variant="destructive" disabled={deleteTeamMutation.isPending || (deleteMode === 'move' && !moveTargetId)} onClick={() => { if (!deleteTeam) return; deleteTeamMutation.mutate({ id: deleteTeam.id, mode: deleteMode, targetTeamId: deleteMode === 'move' ? moveTargetId : undefined }); }}>
              {deleteTeamMutation.isPending ? t('admin.deleting') : t('admin.deleteTeamBtn')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TeamMembersSection({ teamId, newMemberId, setNewMemberId }: { teamId: string; newMemberId: string; setNewMemberId: (v: string) => void }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data: membersData } = useQuery({ queryKey: ['admin', 'teams', teamId, 'members'], queryFn: () => apiGet<{ data: TeamMember[] }>(`/admin/teams/${teamId}/members`) });
  const addMember = useMutation({
    mutationFn: () => apiPost(`/admin/teams/${teamId}/members`, { discordUserId: newMemberId }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'teams', teamId, 'members'] }); queryClient.invalidateQueries({ queryKey: ['admin', 'teams'] }); setNewMemberId(''); },
  });
  const removeMember = useMutation({
    mutationFn: (memberId: string) => apiPost(`/admin/teams/${teamId}/members/${memberId}/delete`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'teams', teamId, 'members'] }); queryClient.invalidateQueries({ queryKey: ['admin', 'teams'] }); },
  });
  const members = membersData?.data || [];

  return (
    <div className="mt-4 border-t border-border pt-4 space-y-3">
      <h4 className="text-sm font-semibold">{t('admin.membersTitle')}</h4>
      <div className="flex gap-2">
        <Input value={newMemberId} onChange={(e) => setNewMemberId(e.target.value)} placeholder={t('admin.discordUserId')} className="flex-1" />
        <Button onClick={() => addMember.mutate()} disabled={!newMemberId} size="sm">{t('admin.addMember')}</Button>
      </div>
      {members.map((m) => (
        <div key={m.id} className="flex items-center justify-between text-sm">
          <code className="bg-secondary px-1 rounded">{m.discordUserId}</code>
          <Button variant="ghost" size="sm" onClick={() => removeMember.mutate(m.id)}><Trash2 className="h-3 w-3" /></Button>
        </div>
      ))}
      {members.length === 0 && <p className="text-sm text-muted-foreground">{t('admin.noMembers')}</p>}
    </div>
  );
}
