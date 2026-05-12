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

export const getSocket = (userId: string, accessToken?: string | null, getCursors?: () => NotificationCursor[]): Socket => {
  if (!socket || currentSocketUserId !== userId) {
    if (socket) {
      socket.disconnect();
    }

    socket = io(BASE_URL, {
      path: '/socket.io',
      auth: { token: accessToken },
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log('Socket connected, initiating sync...');
      if (getCursors) {
        const cursors = getCursors();
        if (cursors.length > 0) {
          const syncRequests = cursors.map(c => ({
            channelId: c.channelId,
            lastSequence: c.lastKnownSequence
          }));

          socket?.emit(SocketEvent.SYNC_NOTIFICATIONS, { syncRequests }, (response: SyncResponse) => {
            console.log('Sync complete:', response);
          });
        }
      }
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
