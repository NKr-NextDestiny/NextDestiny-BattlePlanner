import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Users, UserPlus } from 'lucide-react';

interface TeamWithCount {
  id: string;
  name: string;
  discordRoleId: string;
  individualMemberCount: number;
  createdAt: string;
}

interface TeamMember {
  id: string;
  teamId: string;
  discordUserId: string;
  createdAt: string;
}

export default function TeamsPage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRoleId, setNewRoleId] = useState('');
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);
  const [newMemberId, setNewMemberId] = useState('');

  const { data: teamsData } = useQuery({
    queryKey: ['admin', 'teams'],
    queryFn: () => apiGet<{ data: TeamWithCount[] }>('/admin/teams'),
  });

  const createTeam = useMutation({
    mutationFn: () => apiPost('/admin/teams', { name: newName, discordRoleId: newRoleId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'teams'] });
      setShowCreate(false);
      setNewName('');
      setNewRoleId('');
    },
  });

  const deleteTeam = useMutation({
    mutationFn: (id: string) => apiPost(`/admin/teams/${id}/delete`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'teams'] }),
  });

  const teams = teamsData?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Teams</h1>
        <Button onClick={() => setShowCreate(!showCreate)} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          New Team
        </Button>
      </div>

      {showCreate && (
        <div className="rounded-lg border border-border bg-card p-4 space-y-3">
          <div>
            <Label>Team Name</Label>
            <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Team Alpha" />
          </div>
          <div>
            <Label>Discord Role ID</Label>
            <Input value={newRoleId} onChange={(e) => setNewRoleId(e.target.value)} placeholder="e.g. 123456789012345678" />
          </div>
          <div className="flex gap-2">
            <Button onClick={() => createTeam.mutate()} disabled={!newName || !newRoleId}>Create</Button>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {teams.map((team) => (
          <div key={team.id} className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  {team.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Role ID: <code className="bg-secondary px-1 rounded">{team.discordRoleId}</code>
                  {' '}&middot; {team.individualMemberCount} individual member(s)
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setExpandedTeam(expandedTeam === team.id ? null : team.id)}
                >
                  <UserPlus className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => { if (confirm(`Delete team "${team.name}"?`)) deleteTeam.mutate(team.id); }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {expandedTeam === team.id && (
              <TeamMembersSection teamId={team.id} newMemberId={newMemberId} setNewMemberId={setNewMemberId} />
            )}
          </div>
        ))}

        {teams.length === 0 && (
          <p className="text-center text-muted-foreground py-8">No teams yet. Create one to get started.</p>
        )}
      </div>
    </div>
  );
}

function TeamMembersSection({ teamId, newMemberId, setNewMemberId }: { teamId: string; newMemberId: string; setNewMemberId: (v: string) => void }) {
  const queryClient = useQueryClient();

  const { data: membersData } = useQuery({
    queryKey: ['admin', 'teams', teamId, 'members'],
    queryFn: () => apiGet<{ data: TeamMember[] }>(`/admin/teams/${teamId}/members`),
  });

  const addMember = useMutation({
    mutationFn: () => apiPost(`/admin/teams/${teamId}/members`, { discordUserId: newMemberId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'teams', teamId, 'members'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'teams'] });
      setNewMemberId('');
    },
  });

  const removeMember = useMutation({
    mutationFn: (memberId: string) => apiPost(`/admin/teams/${teamId}/members/${memberId}/delete`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'teams', teamId, 'members'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'teams'] });
    },
  });

  const members = membersData?.data || [];

  return (
    <div className="mt-4 border-t border-border pt-4 space-y-3">
      <h4 className="text-sm font-semibold">Individual Members (by Discord User ID)</h4>
      <div className="flex gap-2">
        <Input
          value={newMemberId}
          onChange={(e) => setNewMemberId(e.target.value)}
          placeholder="Discord User ID"
          className="flex-1"
        />
        <Button onClick={() => addMember.mutate()} disabled={!newMemberId} size="sm">Add</Button>
      </div>
      {members.map((m) => (
        <div key={m.id} className="flex items-center justify-between text-sm">
          <code className="bg-secondary px-1 rounded">{m.discordUserId}</code>
          <Button variant="ghost" size="sm" onClick={() => removeMember.mutate(m.id)}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      ))}
      {members.length === 0 && <p className="text-sm text-muted-foreground">No individual members</p>}
    </div>
  );
}
