import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Users2, Map, Gamepad2, FileText } from 'lucide-react';

interface Stats {
  totalUsers: number;
  totalBattleplans: number;
  totalGames: number;
  totalMaps: number;
  totalTeams: number;
  recentUsers: Array<{ id: string; username: string; discordUsername: string; createdAt: string }>;
}

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => apiGet<{ data: Stats }>('/admin/settings/stats'),
  });

  const stats = data?.data;

  const cards = [
    { label: 'Users', value: stats?.totalUsers, icon: Users },
    { label: 'Teams', value: stats?.totalTeams, icon: Users2 },
    { label: 'Games', value: stats?.totalGames, icon: Gamepad2 },
    { label: 'Maps', value: stats?.totalMaps, icon: Map },
    { label: 'Battleplans', value: stats?.totalBattleplans, icon: FileText },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{card.label}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className="h-8 w-20" /> : <div className="text-2xl font-bold">{card.value}</div>}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Users</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
            </div>
          ) : (
            <div className="space-y-2">
              {stats?.recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                  <div>
                    <span className="font-medium">{user.username}</span>
                    <span className="text-sm text-muted-foreground ml-2">{user.discordUsername}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
