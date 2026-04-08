import { create } from 'zustand';
import type { User, Team } from '@nd-battleplanner/shared';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  teams: Team[];
  activeTeamId: string | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  setAuth: (user: User, accessToken: string, teams: Team[]) => void;
  setTeams: (teams: Team[]) => void;
  setActiveTeamId: (teamId: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  teams: [],
  activeTeamId: localStorage.getItem('activeTeamId'),
  isAdmin: false,
  isAuthenticated: false,
  setAuth: (user, accessToken, teams) =>
    set({ user, accessToken, teams, isAdmin: user.role === 'admin', isAuthenticated: true }),
  setTeams: (teams) => set({ teams }),
  setActiveTeamId: (teamId) => {
    localStorage.setItem('activeTeamId', teamId);
    set({ activeTeamId: teamId });
  },
  logout: () => {
    localStorage.removeItem('activeTeamId');
    set({ user: null, accessToken: null, teams: [], activeTeamId: null, isAdmin: false, isAuthenticated: false });
  },
}));
