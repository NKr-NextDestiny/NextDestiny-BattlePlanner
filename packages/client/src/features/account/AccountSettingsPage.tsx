import { useAuthStore } from '@/stores/auth.store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AccountSettingsPage() {
  const { user, teams } = useAuthStore();

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Account Settings</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            {user.discordAvatar ? (
              <img
                src={`https://cdn.discordapp.com/avatars/${user.discordId}/${user.discordAvatar}.png?size=64`}
                alt=""
                className="h-12 w-12 rounded-full"
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-lg font-bold text-primary">
                {user.username[0].toUpperCase()}
              </div>
            )}
            <span>Account Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between py-2 border-b border-border/50">
            <span className="text-muted-foreground">Username</span>
            <span className="font-medium">{user.username}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-border/50">
            <span className="text-muted-foreground">Discord</span>
            <span className="font-medium">{user.discordUsername}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-border/50">
            <span className="text-muted-foreground">Discord ID</span>
            <code className="font-medium bg-secondary px-1.5 py-0.5 rounded text-xs">{user.discordId}</code>
          </div>
          <div className="flex justify-between py-2 border-b border-border/50">
            <span className="text-muted-foreground">Role</span>
            <span className="font-medium capitalize">{user.role}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-muted-foreground">Member since</span>
            <span className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Teams</CardTitle>
        </CardHeader>
        <CardContent>
          {teams.length > 0 ? (
            <div className="space-y-2">
              {teams.map((team) => (
                <div key={team.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <span className="font-medium">{team.name}</span>
                  <code className="text-xs bg-secondary px-1.5 py-0.5 rounded text-muted-foreground">
                    Role: {team.discordRoleId}
                  </code>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">You are not assigned to any teams.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
