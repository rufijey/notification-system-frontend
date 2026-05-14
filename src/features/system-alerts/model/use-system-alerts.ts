import { useEffect, useRef } from 'react';
import { useSelector, useDispatch, useStore } from 'react-redux';
import { type RootState } from '@/app/providers/store';
import { updateAppBadge } from '@/shared/lib/browser/badging';
import { requestNotificationPermission } from '@/shared/lib/browser/notifications';
import { registerAndSubscribePush } from '@/shared/lib/browser/web-push';
import { getSocket } from '@/shared/lib/socket';
import { SocketEvent } from '@/entities/notifications/model/constants';
import { useGetChannelsQuery } from '@/entities/notifications/api';
import { processOfflineQueue, updateHistoryCacheForChannel } from '@/entities/notifications/lib/offline-queue';

export const useSystemAlerts = () => {
  const dispatch = useDispatch();
  const store = useStore<RootState>();
  const userId = useSelector((state: RootState) => state.user.currentUserId);
  const accessToken = useSelector((state: RootState) => state.user.accessToken);

  const { data: channels = [] } = useGetChannelsQuery(userId || '', {
    skip: !userId,
  });

  const channelsRef = useRef(channels);
  useEffect(() => {
    channelsRef.current = channels;
  }, [channels]);

  useEffect(() => {
    const totalUnread = channels.reduce((acc, channel) => acc + (channel.unreadCount || 0), 0);
    updateAppBadge(totalUnread);
  }, [channels]);

  // Window online listener to process queue
  useEffect(() => {
    const handleOnline = () => {
      console.log('Browser is back online. Flushing outbox...');
      processOfflineQueue(dispatch, store.getState);
    };

    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [dispatch, store]);

  useEffect(() => {
    if (!userId || !accessToken) return;

    const getCursors = () => {
      const state = store.getState();
      const queries = (state as any).api?.queries || {};
      const cursors: { channelId: string; lastKnownSequence: number }[] = [];

      Object.keys(queries).forEach((key) => {
        if (key.startsWith('getHistory(')) {
          try {
            const argStr = key.substring(11, key.length - 1);
            const args = JSON.parse(argStr);
            const queryData = queries[key]?.data as { items?: { sequence: number }[] } | undefined;
            if (args.channelId && queryData?.items && queryData.items.length > 0) {
              let maxSeq = 0;
              queryData.items.forEach((item) => {
                if (item.sequence > maxSeq) maxSeq = item.sequence;
              });
              cursors.push({
                channelId: args.channelId,
                lastKnownSequence: maxSeq,
              });
            }
          } catch {}
        }
      });
      return cursors;
    };

    const handleSyncComplete = (notifications: any[]) => {
      if (!notifications || notifications.length === 0) return;
      console.log(`[Sync] Received ${notifications.length} missed notifications`);

      const state = store.getState();
      const currentUserId = state.user.currentUserId;
      if (!currentUserId) return;

      const byChannel: Record<string, any[]> = {};
      notifications.forEach((n) => {
        if (!byChannel[n.channelId]) byChannel[n.channelId] = [];
        byChannel[n.channelId].push(n);
      });

      Object.entries(byChannel).forEach(([channelId, notifs]) => {
        updateHistoryCacheForChannel(dispatch, store.getState, currentUserId, channelId, (draft: any) => {
          if (!draft || !draft.items) return;
          notifs.forEach((notif) => {
            const existingIndex = draft.items.findIndex((x: any) => x.id === notif.id);
            if (existingIndex === -1) {
              draft.items.push(notif);
            }
          });
          draft.items.sort((a: any, b: any) => a.sequence - b.sequence);
        });
      });
    };

    const socket = getSocket(userId, accessToken);

    const handleConnect = () => {
      console.log('Socket connected. Flushing outbox and initiating history sync...');
      processOfflineQueue(dispatch, store.getState);

      const cursors = getCursors();
      if (cursors.length > 0) {
        const syncRequests = cursors.map(c => ({
          channelId: c.channelId,
          lastSequence: c.lastKnownSequence
        }));

        socket.emit(SocketEvent.SYNC_NOTIFICATIONS, { syncRequests }, (response: any) => {
          if (response?.notifications) {
            handleSyncComplete(response.notifications);
          }
        });
      }
    };

    socket.on('connect', handleConnect);

    // If socket is already connected, try processing the queue
    if (socket.connected) {
      processOfflineQueue(dispatch, store.getState);
    }

    if (Notification.permission === 'default') {
      requestNotificationPermission().then(() => {
        registerAndSubscribePush().catch(console.error);
      });
    } else if (Notification.permission === 'granted') {
      registerAndSubscribePush().catch(console.error);
    }

    return () => {
      socket.off('connect', handleConnect);
    };
  }, [userId, accessToken, dispatch, store]);
};
