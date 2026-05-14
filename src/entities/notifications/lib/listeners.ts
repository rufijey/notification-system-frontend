import { Socket } from 'socket.io-client';
import type { Notification, Channel } from '../model/types';
import { SocketEvent } from '../model/constants';

export const createChannelListListener = (
  userId: string,
  updateCachedData: (cb: (draft: Channel[]) => void) => void,
  socket: Socket
) => {
  return (notification: Notification) => {
    updateCachedData((draft) => {
      const channelIndex = draft.findIndex((c) => c.channelId === notification.channelId);

      if (channelIndex !== -1) {
        const channel = draft[channelIndex];

        if (!notification.parentNotificationId) {
          const lastRead = channel.lastReadSequence ?? 0;
          const lastKnownSeq = channel.lastNotificationSequence ?? 0;

          // Only update last notification info if this incoming notification is newer or equal
          if (notification.sequence >= lastKnownSeq) {
            channel.lastNotification = notification.text;
            channel.lastActivity = notification.createdAt;
            channel.lastNotificationSequence = notification.sequence;
            channel.lastNotificationSenderId = notification.senderId;
            channel.lastNotificationStatus = 'DELIVERED';
          }

          // Only increment unread count if this is a live notification that has not been read
          // and has not already been counted (is newer than lastKnownSeq)
          if (
            notification.senderId !== userId &&
            notification.sequence > lastRead &&
            notification.sequence > lastKnownSeq
          ) {
            channel.unreadCount += 1;
          }

          const [movedChannel] = draft.splice(channelIndex, 1);
          draft.unshift(movedChannel);
        }
      }

      if (notification.senderId !== userId) {
        socket.emit(SocketEvent.ACK, { notificationId: notification.id });
      }
    });
  };
};

export const createChannelReadListener = (
  userId: string,
  updateCachedData: (cb: (draft: Channel[]) => void) => void
) => {
  return (payload: { channelId: string; userId: string; lastReadSequence: number; unreadCount: number }) => {
    updateCachedData((draft) => {
      const channel = draft.find(c => c.channelId === payload.channelId);
      if (!channel) return;

      if (payload.userId === userId) {
        channel.unreadCount = payload.unreadCount;
        channel.lastReadSequence = payload.lastReadSequence;
      } else {
        if (payload.lastReadSequence > (channel.othersLastReadSequence || 0)) {
          channel.othersLastReadSequence = payload.lastReadSequence;
        }
      }
    });
  };
};

export const createMessageReadListener = (
  userId: string,
  updateCachedData: (cb: (draft: Channel[]) => void) => void
) => {
  return (payload: { channelId: string; userId: string; sequence: number }) => {
    updateCachedData((draft) => {
      const channel = draft.find(c => c.channelId === payload.channelId);
      if (!channel) return;

      if (payload.userId === userId) {
        if (payload.sequence > channel.lastReadSequence) {
          channel.lastReadSequence = payload.sequence;
          channel.unreadCount = Math.max(0, channel.unreadCount - 1);
        }
      } else {
        if (payload.sequence > (channel.othersLastReadSequence || 0)) {
          channel.othersLastReadSequence = payload.sequence;
        }
      }
    });
  };
};

export const createChannelJoinedListener = (
  updateCachedData: (cb: (draft: Channel[]) => void) => void
) => {
  return (channel: Channel) => {
    updateCachedData((draft) => {
      const exists = draft.find(c => c.channelId === channel.channelId);
      if (!exists) {
        draft.unshift(channel);
      }
    });
  };
};

export const createChannelUpdatedListener = (
  userId: string,
  updateCachedData: (cb: (draft: Channel[]) => void) => void
) => {
  return (payload: { channelId: string; userId?: string; role?: 'ADMIN' | 'PUBLISHER' | 'SUBSCRIBER'; title?: string }) => {
    updateCachedData((draft) => {
      const channel = draft.find(c => c.channelId === payload.channelId);
      if (channel) {
        if (payload.userId === userId && payload.role) {
          channel.role = payload.role;
        }
        if (payload.title !== undefined) {
          channel.title = payload.title;
        }
      }
    });
  };
};

export const createNotificationListener = (
  channelId: string,
  userId: string,
  updateCachedData: (cb: (draft: Notification[]) => void) => void,
  socket: Socket,
  query?: string
) => {
  return (notification: Notification) => {
    if (notification.channelId !== channelId) return;

    if (query && query.trim()) {
      const q = query.trim().toLowerCase();
      const textMatch = (notification.text || '').toLowerCase().includes(q);
      if (!textMatch) return;
    }

    updateCachedData((draft) => {
      if (notification.senderId === userId && notification.clientNotificationId) {
        const index = draft.findIndex(m => m.clientNotificationId === notification.clientNotificationId);
        if (index !== -1) draft.splice(index, 1);
      }

      const existingIndex = draft.findIndex((m) => m.id === notification.id);
      if (existingIndex === -1) {
        draft.push(notification);
      }
    });

    if (notification.senderId !== userId) {
      socket.emit(SocketEvent.ACK, { notificationId: notification.id });
    }
  };
};

export const createNotificationReadListener = (
  channelId: string,
  userId: string,
  updateCachedData: (cb: (draft: Notification[]) => void) => void
) => {
  return (payload: { channelId: string; userId: string; sequence?: number; lastReadSequence?: number }) => {
    if (payload.channelId !== channelId) return;

    const sequence = payload.lastReadSequence || payload.sequence || 0;

    updateCachedData((draft) => {
      draft.forEach(m => {
        if (m.sequence > 0 && m.sequence <= sequence) {
          if (payload.userId !== userId && m.senderId === userId) {
            m.status = 'READ';
          }
          if (payload.userId === userId && m.senderId !== userId) {
            m.status = 'READ';
          }
        }
      });
    });
  };
};

export const createNotificationDeliveredListener = (
  channelId: string,
  userId: string,
  updateCachedData: (cb: (draft: Notification[]) => void) => void
) => {
  return (payload: { channelId: string; userId: string; notificationId: string }) => {
    if (payload.channelId !== channelId) return;

    updateCachedData((draft) => {
      if (payload.userId !== userId) {
        const msg = draft.find(m => m.id === payload.notificationId);
        if (msg && msg.senderId === userId && msg.status !== 'READ') {
          msg.status = 'DELIVERED';
        }
      }
    });
  };
};

export const createNotificationDeletedListener = (
  channelId: string,
  updateCachedData: (cb: (draft: Notification[]) => void) => void
) => {
  return (payload: { notificationId: string; channelId: string }) => {
    if (payload.channelId !== channelId) return;

    updateCachedData((draft) => {
      const index = draft.findIndex(m => m.id === payload.notificationId);
      if (index !== -1) {
        draft.splice(index, 1);
      }
    });
  };
};

export const createGlobalNotificationListener = (
  currentUserId: string,
  updateCachedData: (cb: (draft: any[]) => void) => void,
  searchQuery?: string
) => {
  return (notification: any) => {
    if (notification.senderId === currentUserId) return;

    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const textMatch = (notification.text || '').toLowerCase().includes(q);
      if (!textMatch) return;
    }

    updateCachedData((draft) => {
      const exists = draft.some((notif) => notif.id === notification.id);
      if (!exists) {
        const channelMember = {
          userId: currentUserId,
          lastReadSequence: notification.channel?.members?.[0]?.lastReadSequence ?? 0,
        };

        const newNotif = {
          ...notification,
          channel: {
            ...notification.channel,
            members: [channelMember],
          },
        };

        draft.unshift(newNotif);
      }
    });
  };
};

export const createGlobalChannelReadListener = (
  currentUserId: string,
  updateCachedData: (cb: (draft: any[]) => void) => void
) => {
  return (payload: { channelId: string; userId: string; lastReadSequence: number }) => {
    if (payload.userId !== currentUserId) return;

    updateCachedData((draft) => {
      draft.forEach((notif) => {
        if (notif.channelId === payload.channelId) {
          if (!notif.channel) notif.channel = {};
          if (!notif.channel.members) notif.channel.members = [];
          if (notif.channel.members.length === 0) {
            notif.channel.members.push({ userId: currentUserId, lastReadSequence: payload.lastReadSequence });
          } else {
            notif.channel.members[0].lastReadSequence = payload.lastReadSequence;
          }
        }
      });
    });
  };
};
