export interface User {
  id: string;
  username: string;
  discordId: string;
  discordUsername: string;
  discordAvatar: string | null;
  discordRoles: string[];
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'admin' | 'user';

export interface TokenPayload {
  userId: string;
  role: UserRole;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  teams: Team[];
}

export interface DiscordCallbackRequest {
  code: string;
}

export interface Team {
  id: string;
  name: string;
  discordRoleId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  id: string;
  teamId: string;
  discordUserId: string;
  createdAt: string;
}
