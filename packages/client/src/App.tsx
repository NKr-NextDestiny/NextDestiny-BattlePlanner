import { Routes, Route } from 'react-router-dom';
import { lazy, Suspense, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { apiPost } from '@/lib/api';
import { AppLayout } from '@/components/layout/AppLayout';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { ProtectedRoute, AdminRoute, TeamRoute } from '@/components/auth/ProtectedRoute';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy loaded pages
const HomePage = lazy(() => import('@/features/home/HomePage'));
const DiscordCallbackPage = lazy(() => import('@/features/auth/DiscordCallbackPage'));
const TeamSelectionPage = lazy(() => import('@/features/teams/TeamSelectionPage'));
const GameDashboard = lazy(() => import('@/features/game/GameDashboard'));
const MyPlansPage = lazy(() => import('@/features/battleplan/MyPlansPage'));
const PublicPlansPage = lazy(() => import('@/features/battleplan/PublicPlansPage'));
const BattleplanViewer = lazy(() => import('@/features/battleplan/BattleplanViewer'));
const CreateRoomPage = lazy(() => import('@/features/room/CreateRoomPage'));
const RoomPage = lazy(() => import('@/features/room/RoomPage'));
const AdminDashboard = lazy(() => import('@/features/admin/DashboardPage'));
const AdminUsers = lazy(() => import('@/features/admin/users/UsersPage'));
const AdminTeams = lazy(() => import('@/features/admin/teams/TeamsPage'));
const AdminSettings = lazy(() => import('@/features/admin/settings/SettingsPage'));
const AccountSettingsPage = lazy(() => import('@/features/account/AccountSettingsPage'));
const AboutPage = lazy(() => import('@/features/legal/AboutPage'));
const HelpPage = lazy(() => import('@/features/legal/HelpPage'));
const FAQPage = lazy(() => import('@/features/legal/FAQPage'));
const ChangelogPage = lazy(() => import('@/features/legal/ChangelogPage'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <Skeleton className="h-8 w-48" />
    </div>
  );
}

export function App() {
  const { setAuth } = useAuthStore();

  useEffect(() => {
    apiPost<{ data: { user: any; accessToken: string; teams: any[] } }>('/auth/refresh', {})
      .then((res) => {
        if (res.data) {
          setAuth(res.data.user, res.data.accessToken, res.data.teams);
        }
      })
      .catch(() => {
        // Not authenticated
      });
  }, []);

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Discord OAuth callback — no layout */}
        <Route path="/auth/discord/callback" element={<DiscordCallbackPage />} />

        {/* Team selection — no app layout */}
        <Route element={<ProtectedRoute />}>
          <Route path="/teams" element={<TeamSelectionPage />} />
        </Route>

        {/* Main app */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />

          {/* Auth-required pages */}
          <Route element={<ProtectedRoute />}>
            <Route path="/help" element={<HelpPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/changelog" element={<ChangelogPage />} />
            <Route path="/about" element={<AboutPage />} />
          </Route>

          {/* Team-scoped routes */}
          <Route element={<TeamRoute />}>
            <Route path="/:gameSlug" element={<GameDashboard />} />
            <Route path="/:gameSlug/plans/public" element={<PublicPlansPage />} />
            <Route path="/:gameSlug/plans/:planId" element={<BattleplanViewer />} />
            <Route path="/:gameSlug/plans" element={<MyPlansPage />} />
            <Route path="/room/create" element={<CreateRoomPage />} />
            <Route path="/account" element={<AccountSettingsPage />} />
          </Route>

          {/* Admin routes */}
          <Route element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/teams" element={<AdminTeams />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
            </Route>
          </Route>
        </Route>

        {/* Full-screen room — requires auth + team */}
        <Route element={<TeamRoute />}>
          <Route path="/room/:connectionString" element={<RoomPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
