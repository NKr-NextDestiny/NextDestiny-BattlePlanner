import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/stores/auth.store';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const token = useAuthStore.getState().accessToken;
    if (!token) throw new Error('Not authenticated');
    socket = io(window.location.origin, {
      autoConnect: false,
      auth: { token },
    });
  }
  return socket;
}

export function connectSocket() {
  const s = getSocket();
  const token = useAuthStore.getState().accessToken;
  if (!token) return;
  s.auth = { token };
  if (!s.connected) {
    s.connect();
  }
}

export function disconnectSocket() {
  if (socket?.connected) {
    socket.disconnect();
  }
  socket = null;
}
