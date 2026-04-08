import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import { LogOut, Shield, Settings, Users, Globe } from 'lucide-react';
import { APP_VERSION, APP_NAME } from '@nd-battleplanner/shared';
import { apiGet, apiPost } from '@/lib/api';
import { languages } from '@/lib/i18n';

function discordAvatarUrl(discordId: string, hash: string, size: number) {
  const ext = hash.startsWith('a_') ? 'gif' : 'png';
  return `https://cdn.discordapp.com/avatars/${discordId}/${hash}.${ext}?size=${size}`;
}

export function AppLayout() {
  const { user, isAdmin, logout, isAuthenticated, teams, activeTeamId, setActiveTeamId } = useAuthStore();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const activeTeam = teams.find((t) => t.id === activeTeamId);

  const handleLogout = async () => {
    try {
      await apiPost('/auth/logout');
    } catch {
      // Continue even if request fails
    }
    logout();
    navigate('/');
  };

  const handleDiscordLogin = () => {
    apiGet<{ data: { url: string } }>('/auth/discord/url').then(({ data }) => {
      window.location.href = data.url;
    });
  };

  const handleSwitchTeam = (teamId: string) => {
    setActiveTeamId(teamId);
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background gaming-bg relative overflow-x-hidden">
      <div className="gaming-glow-line top-0 left-0 z-50" />

      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center justify-between px-4 w-full">
          <Link to="/" className="flex items-center gap-2 transition-transform hover:scale-105 group">
            <img src="/nd-logo.png" alt="" className="h-8 w-8 rounded-md logo-glow" />
            <span className="text-xl font-bold font-heading text-primary drop-shadow-[0_0_8px_oklch(0.705_0.187_48/0.5)] group-hover:drop-shadow-[0_0_12px_oklch(0.705_0.187_48/0.8)] transition-all">{APP_NAME}</span>
          </Link>

          <div className="flex items-center gap-2">
            {/* Language switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1.5 px-2">
                  <Globe className="h-4 w-4" />
                  <span className="text-xs uppercase">{i18n.language === 'pirate' ? '🏴‍☠️' : i18n.language}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{t('nav.language')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => i18n.changeLanguage(lang.code)}
                    className={i18n.language === lang.code ? 'bg-primary/10 text-primary' : ''}
                  >
                    {lang.code === 'pirate' ? '🏴‍☠️ ' : ''}{lang.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {isAuthenticated && user ? (
              <>
                {/* Team indicator / switcher */}
                {activeTeam && (
                  teams.length > 1 ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Users className="h-4 w-4" />
                          {activeTeam.name}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>{t('nav.switchTeam')}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {teams.map((team) => (
                          <DropdownMenuItem
                            key={team.id}
                            onClick={() => handleSwitchTeam(team.id)}
                            className={team.id === activeTeamId ? 'bg-primary/10 text-primary' : ''}
                          >
                            {team.name}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <div className="flex items-center gap-1.5 rounded-md border border-border/60 bg-card/50 px-3 py-1.5 text-sm text-muted-foreground">
                      <Users className="h-3.5 w-3.5" />
                      {activeTeam.name}
                    </div>
                  )
                )}

                {/* User menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-2">
                      {user.discordAvatar ? (
                        <img
                          src={discordAvatarUrl(user.discordId, user.discordAvatar, 32)}
                          alt=""
                          className="h-6 w-6 rounded-full"
                        />
                      ) : (
                        <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                          {(user.username[0] ?? '?').toUpperCase()}
                        </div>
                      )}
                      {user.username}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>{user.discordUsername}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {isAdmin && (
                      <DropdownMenuItem onClick={() => navigate('/admin')}>
                        <Shield className="h-4 w-4 mr-2" />
                        {t('nav.adminPanel')}
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => navigate('/account')}>
                      <Settings className="h-4 w-4 mr-2" />
                      {t('nav.account')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="h-4 w-4 mr-2" />
                      {t('nav.logout')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button onClick={handleDiscordLogin} className="gap-2 bg-[#5865F2] hover:bg-[#4752C4] text-white">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.947 2.418-2.157 2.418z"/>
                </svg>
                {t('nav.loginDiscord')}
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t py-4">
        <div className="container flex items-center justify-between px-4 text-xs text-muted-foreground">
          <span>{APP_NAME} v{APP_VERSION}</span>
          <div className="flex items-center gap-4">
            {isAuthenticated && (
              <>
                <Link to="/help" className="hover:text-primary transition-colors">Help</Link>
                <Link to="/faq" className="hover:text-primary transition-colors">FAQ</Link>
                <Link to="/changelog" className="hover:text-primary transition-colors">Changelog</Link>
                <Link to="/about" className="hover:text-primary transition-colors">About</Link>
              </>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
