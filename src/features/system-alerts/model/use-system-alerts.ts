import { useEffect, useRef } from 'react';
import { useSelector, useDispatch, useStore } from 'react-redux';
import { type RootState } from '@/app/providers/store';
import { updateAppBadge } from '@/shared/lib/browser/badging';
import { requestNotificationPermission } from '@/shared/lib/browser/notifications';
import { registerAndSubscribePush } from '@/shared/lib/browser/web-push';
import { getSocket } from '@/shared/lib/socket';
import { useGetChannelsQuery } from '@/entities/notifications/api';
import { processOfflineQueue } from '@/entities/notifications/lib/offline-queue';

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

    const socket = getSocket(userId, accessToken);

    const handleConnect = () => {
      console.log('Socket connected. Flushing outbox...');
      processOfflineQueue(dispatch, store.getState);
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
