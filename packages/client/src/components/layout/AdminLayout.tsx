import { Link, Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Users,
  Users2,
  Settings,
  LayoutDashboard,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AdminLayout() {
  const location = useLocation();
  const { t } = useTranslation();

  const navItems = [
    { label: t('admin.dashboard'), href: '/admin', icon: LayoutDashboard },
    { label: t('admin.users'), href: '/admin/users', icon: Users },
    { label: t('admin.teams'), href: '/admin/teams', icon: Users2 },
    { label: t('admin.settings'), href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      <aside className="w-64 border-r bg-sidebar-background">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-1">
            <Button variant="ghost" className="w-full justify-start mb-4" asChild>
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t('admin.back')}
              </Link>
            </Button>

            <h2 className="px-2 mb-2 text-lg font-semibold tracking-wide">Admin Panel</h2>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Button
                  key={item.href}
                  variant={isActive ? 'secondary' : 'ghost'}
                  className="w-full justify-start"
                  asChild
                >
                  <Link to={item.href}>
                    <Icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Link>
                </Button>
              );
            })}
          </div>
        </ScrollArea>
      </aside>

      <div className="flex-1 overflow-auto flex flex-col">
        <div className="flex-1 p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
