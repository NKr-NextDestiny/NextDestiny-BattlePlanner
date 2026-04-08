import { eq, inArray, or } from 'drizzle-orm';
import { db } from '../db/connection.js';
import { teams, teamMembers } from '../db/schema/index.js';

export async function getUserTeams(discordId: string, discordRoles: string[]): Promise<typeof teams.$inferSelect[]> {
  // Teams by Discord role
  const roleTeams = discordRoles.length > 0
    ? await db.select().from(teams).where(inArray(teams.discordRoleId, discordRoles))
    : [];

  // Teams by individual assignment
  const individualAssignments = await db.select({ teamId: teamMembers.teamId })
    .from(teamMembers)
    .where(eq(teamMembers.discordUserId, discordId));

  if (individualAssignments.length === 0) return roleTeams;

  const individualTeamIds = individualAssignments.map(a => a.teamId);
  const individualTeams = await db.select().from(teams)
    .where(inArray(teams.id, individualTeamIds));

  // Merge and deduplicate
  const seen = new Set(roleTeams.map(t => t.id));
  const merged = [...roleTeams];
  for (const t of individualTeams) {
    if (!seen.has(t.id)) {
      merged.push(t);
      seen.add(t.id);
    }
  }
  return merged;
}

export async function isUserInTeam(discordId: string, discordRoles: string[], teamId: string): Promise<boolean> {
  // Check if team exists and matches a Discord role
  const [team] = await db.select().from(teams).where(eq(teams.id, teamId));
  if (!team) return false;

  if (discordRoles.includes(team.discordRoleId)) return true;

  // Check individual assignment
  const [member] = await db.select().from(teamMembers).where(
    or(
      eq(teamMembers.discordUserId, discordId),
    )!,
  );
  if (member && member.teamId === teamId) return true;

  // More thorough check: any individual assignment for this team + user
  const assignments = await db.select().from(teamMembers).where(eq(teamMembers.teamId, teamId));
  return assignments.some(a => a.discordUserId === discordId);
}
