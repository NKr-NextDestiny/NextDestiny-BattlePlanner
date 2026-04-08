export interface AppSettings {
  adminDiscordRoleIds: string[];
  adminDiscordUserIds: string[];
  [key: string]: unknown;
}

export interface AdminStats {
  totalUsers: number;
  totalBattleplans: number;
  totalGames: number;
  totalMaps: number;
  totalTeams: number;
  recentUsers: Array<{
    id: string;
    username: string;
    discordUsername: string;
    createdAt: string;
  }>;
}
