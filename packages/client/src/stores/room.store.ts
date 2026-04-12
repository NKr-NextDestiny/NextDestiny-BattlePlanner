import { create } from 'zustand';
import type { RoomUserRole } from '@nd-battleplanner/shared';

export interface RoomUser {
  userId: string;
  username: string;
  color: string;
  role: RoomUserRole;
}

export interface CursorPosition {
  userId: string;
  x: number;
  y: number;
  floorId?: string;
  isLaser?: boolean;
}

export interface ChatMessage {
  userId: string;
  username: string;
  text: string;
  color: string;
  timestamp: number;
}

interface RoomStoreState {
  connectionString: string | null;
  users: RoomUser[];
  myColor: string | null;
  myRole: RoomUserRole;
  battleplan: any | null;
  currentFloorId: string | null;
  cursors: Map<string, CursorPosition>;
  chatMessages: ChatMessage[];
  unreadCount: number;

  setConnectionString: (cs: string) => void;
  setUsers: (users: RoomUser[]) => void;
  addUser: (user: RoomUser) => void;
  removeUser: (userId: string) => void;
  setMyColor: (color: string) => void;
  setMyRole: (role: RoomUserRole) => void;
  updateUserRole: (userId: string, role: RoomUserRole) => void;
  setBattleplan: (bp: any | null) => void;
  setCurrentFloorId: (id: string | null) => void;
  updateCursor: (cursor: CursorPosition) => void;
  removeCursor: (userId: string) => void;
  addChatMessage: (msg: ChatMessage) => void;
  resetUnread: () => void;
  updateOperatorSlot: (slotId: string, operatorId: string | null, operator: unknown, side: string) => void;
  reset: () => void;
}

export const useRoomStore = create<RoomStoreState>((set) => ({
  connectionString: null,
  users: [],
  myColor: null,
  myRole: 'editor' as RoomUserRole,
  battleplan: null,
  currentFloorId: null,
  cursors: new Map(),
  chatMessages: [],
  unreadCount: 0,

  setConnectionString: (cs) => set({ connectionString: cs }),
  setUsers: (users) => set({ users }),
  addUser: (user) => set((s) => ({ users: [...s.users, user] })),
  removeUser: (userId) => set((s) => ({
    users: s.users.filter(u => u.userId !== userId),
  })),
  setMyColor: (color) => set({ myColor: color }),
  setMyRole: (role) => set({ myRole: role }),
  updateUserRole: (userId, role) => set((s) => ({
    users: s.users.map(u => u.userId === userId ? { ...u, role } : u),
  })),
  setBattleplan: (bp) => set({ battleplan: bp }),
  setCurrentFloorId: (id) => set({ currentFloorId: id }),
  updateCursor: (cursor) => set((s) => {
    const next = new Map(s.cursors);
    next.set(cursor.userId, cursor);
    return { cursors: next };
  }),
  removeCursor: (userId) => set((s) => {
    const next = new Map(s.cursors);
    next.delete(userId);
    return { cursors: next };
  }),
  addChatMessage: (msg) => set((s) => ({
    chatMessages: [...s.chatMessages, msg],
    unreadCount: s.unreadCount + 1,
  })),
  resetUnread: () => set({ unreadCount: 0 }),
  updateOperatorSlot: (_slotId, _operatorId, _operator, _side) => {
    // Handled via strat store in new architecture
  },
  reset: () => set({
    connectionString: null,
    users: [],
    myColor: null,
    myRole: 'editor' as RoomUserRole,
    battleplan: null,
    currentFloorId: null,
    cursors: new Map(),
    chatMessages: [],
    unreadCount: 0,
  }),
}));
