import { io } from 'socket.io-client';

let socket = null;

export const initClientSocket = (userId) => {
  if (typeof window === 'undefined') return null;

  const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5001';

  if (!socket) {
    socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      if (userId) {
        socket.emit('join_user_room', userId);
      }
    });
  }

  if (socket.connected && userId) {
    socket.emit('join_user_room', userId);
  }

  return socket;
};

export const getClientSocket = () => socket;

export const disconnectClientSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
