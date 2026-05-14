import { io, type Socket } from 'socket.io-client';
import { SocketEvent } from '../../entities/notifications/model/constants';
import type { NotificationCursor, Notification } from '../../entities/notifications/model/types';
import { BASE_URL } from '../api/base';

interface SyncResponse {
  notifications?: Notification[];
  error?: string;
}

let socket: Socket | null = null;
let currentSocketUserId: string | null = null;

export const getSocket = (
  userId: string,
  accessToken?: string | null
): Socket => {
  if (!socket || currentSocketUserId !== userId) {
    if (socket) {
      socket.disconnect();
    }

    socket = io(BASE_URL, {
      path: '/api/socket.io',
      auth: { token: accessToken },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('Socket connected');
    });

    socket.on('reconnect', (attempt) => {
      console.log('Socket reconnected after', attempt, 'attempts');
    });

    currentSocketUserId = userId;
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    currentSocketUserId = null;
  }
};
