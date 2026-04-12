/**
 * RoomSettingsPopover — room info and actions (connection string, delete room).
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { apiDelete } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Settings, Copy, Check, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface RoomSettingsPopoverProps {
  connectionString?: string;
  isRoomOwner: boolean;
}

export function RoomSettingsPopover({ connectionString, isRoomOwner }: RoomSettingsPopoverProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const roomUrl = connectionString
    ? `${window.location.origin}/room/${connectionString}`
    : '';

  const copyLink = async () => {
    await navigator.clipboard.writeText(roomUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const deleteRoom = async () => {
    if (!connectionString) return;
    try {
      await apiDelete(`/rooms/${connectionString}`);
      toast.success(t('room.deleted'));
      navigate('/');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <Settings className="h-3 w-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-3" align="end">
          <h4 className="text-xs font-semibold mb-3">{t('room.settings')}</h4>

          {/* Share link */}
          <div className="space-y-1 mb-3">
            <label className="text-[10px] text-muted-foreground uppercase tracking-wider">{t('room.shareLink')}</label>
            <div className="flex items-center gap-1">
              <code className="text-[10px] bg-muted px-2 py-1 rounded flex-1 truncate">{roomUrl}</code>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 shrink-0" onClick={copyLink}>
                {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
              </Button>
            </div>
          </div>

          {/* Connection ID */}
          <div className="space-y-1 mb-3">
            <label className="text-[10px] text-muted-foreground uppercase tracking-wider">{t('room.connectionId')}</label>
            <code className="text-[10px] bg-muted px-2 py-1 rounded block">{connectionString}</code>
          </div>

          {/* Delete room (owner only) */}
          {isRoomOwner && (
            <Button variant="destructive" size="sm" className="w-full h-7 text-xs" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="h-3 w-3 mr-1" />
              {t('room.deleteRoom')}
            </Button>
          )}
        </PopoverContent>
      </Popover>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('room.deleteRoom')}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">{t('room.deleteConfirm')}</p>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{t('plans.cancel')}</Button>
            </DialogClose>
            <Button variant="destructive" onClick={deleteRoom}>{t('room.deleteRoom')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
