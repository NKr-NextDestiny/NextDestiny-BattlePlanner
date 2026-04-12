/**
 * UserListPopover — shows active users in the room with role badges.
 * Room owner can toggle Editor/Viewer for each user.
 */

import { useTranslation } from 'react-i18next';
import type { RoomUserRole } from '@nd-battleplanner/shared';
import { useRoomStore } from '@/stores/room.store';
import { getSocket } from '@/lib/socket';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';

interface UserListPopoverProps {
  isRoomOwner: boolean;
}

const ROLE_COLORS: Record<RoomUserRole, string> = {
  owner: 'bg-primary text-primary-foreground',
  editor: 'bg-blue-600 text-white',
  viewer: 'bg-muted text-muted-foreground',
};

export function UserListPopover({ isRoomOwner }: UserListPopoverProps) {
  const { t } = useTranslation();
  const users = useRoomStore((s) => s.users);

  const toggleRole = (userId: string, currentRole: RoomUserRole) => {
    const newRole: RoomUserRole = currentRole === 'viewer' ? 'editor' : 'viewer';
    getSocket()?.emit('room:permission-update', { targetUserId: userId, role: newRole });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs gap-1">
          <Users className="h-3 w-3" />
          <span>{users.length}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="end">
        <h4 className="text-xs font-semibold mb-2">{t('room.activeUsers')}</h4>
        <div className="space-y-2">
          {users.map((u) => (
            <div key={u.userId} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: u.color }}
              />
              <span className="text-xs truncate flex-1">{u.username}</span>
              <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 ${ROLE_COLORS[u.role]}`}>
                {t(`room.roles.${u.role}`)}
              </Badge>
              {isRoomOwner && u.role !== 'owner' && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 px-1.5 text-[10px]"
                  onClick={() => toggleRole(u.userId, u.role)}
                >
                  {u.role === 'viewer' ? t('room.makeEditor') : t('room.makeViewer')}
                </Button>
              )}
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
