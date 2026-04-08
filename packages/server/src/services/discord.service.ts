import { DISCORD_SCOPES } from '@nd-battleplanner/shared';

const DISCORD_API = 'https://discord.com/api/v10';

export interface DiscordTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

export interface DiscordUser {
  id: string;
  username: string;
  global_name: string | null;
  avatar: string | null;
}

export interface DiscordGuildMember {
  roles: string[];
  nick: string | null;
  user?: DiscordUser;
}

export function getOAuthUrl(): string {
  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID!,
    redirect_uri: process.env.DISCORD_REDIRECT_URI!,
    response_type: 'code',
    scope: DISCORD_SCOPES,
    prompt: 'consent',
  });
  return `https://discord.com/oauth2/authorize?${params.toString()}`;
}

export async function exchangeCode(code: string): Promise<DiscordTokenResponse> {
  const res = await fetch(`${DISCORD_API}/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID!,
      client_secret: process.env.DISCORD_CLIENT_SECRET!,
      grant_type: 'authorization_code',
      code,
      redirect_uri: process.env.DISCORD_REDIRECT_URI!,
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Discord token exchange failed: ${error}`);
  }

  return res.json() as Promise<DiscordTokenResponse>;
}

export async function fetchDiscordUser(accessToken: string): Promise<DiscordUser> {
  const res = await fetch(`${DISCORD_API}/users/@me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch Discord user: ${res.status}`);
  }

  return res.json() as Promise<DiscordUser>;
}

export async function fetchGuildMember(accessToken: string): Promise<DiscordGuildMember> {
  const guildId = process.env.DISCORD_GUILD_ID!;
  const res = await fetch(`${DISCORD_API}/users/@me/guilds/${guildId}/member`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error('NOT_IN_GUILD');
    }
    throw new Error(`Failed to fetch guild member: ${res.status}`);
  }

  return res.json() as Promise<DiscordGuildMember>;
}
