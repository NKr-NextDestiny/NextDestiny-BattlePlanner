import { Link, Outlet, useLocation } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Users,
  Users2,
  Settings,
  LayoutDashboard,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Benutzer', href: '/admin/users', icon: Users },
  { label: 'Teams', href: '/admin/teams', icon: Users2 },
  { label: 'Einstellungen', href: '/admin/settings', icon: Settings },
];

export function AdminLayout() {
  const location = useLocation();

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      <aside className="w-64 border-r bg-sidebar-background">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-1">
            <Button variant="ghost" className="w-full justify-start mb-4" asChild>
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Zurück
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
