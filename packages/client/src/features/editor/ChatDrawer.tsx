/**
 * Floating chat overlay — bottom-left of map area.
 * Ephemeral messages, guest-disabled input.
 */

import { useState, useRef, useEffect } from 'react';
import { useRoomStore } from '@/stores/room.store';
import { useAuthStore } from '@/stores/auth.store';
import { getSocket } from '@/lib/socket';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, X, Send } from 'lucide-react';

export function ChatDrawer() {
  const [open, setOpen] = useState(false);
  const { chatMessages, unreadCount, resetUnread } = useRoomStore();
  const isAuthenticated = useAuthStore((s) => !!s.user);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      resetUnread();
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
    }
  }, [open, chatMessages.length, resetUnread]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || !isAuthenticated) return;
    getSocket()?.emit('chat:message', { text: text.slice(0, 500) });
    setInput('');
  };

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className="absolute bottom-3 left-3 z-20 flex items-center justify-center h-8 w-8 rounded-full bg-background/90 border hover:bg-muted transition-colors"
        title="Chat"
      >
        <MessageSquare className="h-4 w-4" />
        {!open && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="absolute bottom-12 left-3 z-20 w-72 h-80 bg-background/95 backdrop-blur border rounded-lg flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-3 py-1.5 border-b">
            <span className="text-xs font-medium">Chat</span>
            <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={() => setOpen(false)}>
              <X className="h-3 w-3" />
            </Button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5">
            {chatMessages.map((msg, i) => (
              <div key={i} className="text-xs">
                <span className="font-medium" style={{ color: msg.color }}>{msg.username}: </span>
                <span className="text-foreground">{msg.text}</span>
              </div>
            ))}
            {chatMessages.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">No messages yet</p>
            )}
          </div>

          <div className="flex items-center gap-1 px-2 py-1.5 border-t">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={isAuthenticated ? 'Type a message...' : 'Login to chat'}
              disabled={!isAuthenticated}
              className="h-6 text-xs flex-1"
              maxLength={500}
            />
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={handleSend}
              disabled={!isAuthenticated || !input.trim()}
            >
              <Send className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
