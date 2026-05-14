import { baseApi } from '@/shared/api/base';
import { getSocket } from '@/shared/lib/socket';
import { type RootState } from '@/app/providers/store';
import type { Notification } from '../model/types';
import { SocketEvent } from '../model/constants';
import { generateId } from '@/shared/lib/utils';
import { ApiRoutes } from '@/shared/config';
import { bindSocketToCache } from '../lib/socket-cache-binder';
import { updateMatchingHistoryQueries } from '../lib/cache-utils';
import {
  addToOfflineQueue,
  updateHistoryCacheForChannel,
} from '../lib/offline-queue';
import {
  createNotificationListener,
  createNotificationReadListener,
  createNotificationDeliveredListener,
  createNotificationDeletedListener,
} from '../lib/listeners';

export const notificationsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getHistory: build.query<{ items: Notification[]; hasMore: boolean }, { userId: string; channelId: string; limit?: number; query?: string }>({
      query: ({ channelId, limit = 30, query }) => ({
        url: query
          ? `${ApiRoutes.notifications.history(channelId)}?limit=${limit}&query=${encodeURIComponent(query)}`
          : `${ApiRoutes.notifications.history(channelId)}?limit=${limit}`,
      }),
      providesTags: ['History'],
      transformResponse: (response: { items: Notification[]; hasMore: boolean }) => response,
      async onCacheEntryAdded(
        arg,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved, getState }
      ) {
        if (!arg.channelId) return;

        const state = getState() as RootState;
        const accessToken = state.user.accessToken;
        const socket = getSocket(arg.userId, accessToken);

        const listener = createNotificationListener(arg.channelId, arg.userId, (cb) => {
          updateCachedData((draft) => cb(draft.items));
        }, socket, arg.query);

        const handleSync = () => {
          const apiState = (getState() as any)[baseApi.reducerPath];
          // Find the current history for this channel to get the last known sequence
          const queryKey = Object.keys(apiState.queries).find(key => 
            key.startsWith('getHistory') && key.includes(`"channelId":"${arg.channelId}"`)
          );
          
          const historyData = queryKey ? apiState.queries[queryKey]?.data?.items as any[] : [];
          const lastKnownSequence = historyData?.length > 0 
            ? Math.max(...historyData.map(m => m.sequence))
            : 0;

          console.log(`[Sync] Initiating history sync for channel ${arg.channelId} from sequence ${lastKnownSequence}`);

          socket.emit(SocketEvent.SYNC_NOTIFICATIONS, { 
            syncRequests: [{ channelId: arg.channelId, lastSequence: lastKnownSequence }] 
          }, (response: { notifications?: any[] }) => {
            if (response?.notifications && Array.isArray(response.notifications)) {
              console.log(`[Sync] Processing ${response.notifications.length} missed notifications for history`);
              response.notifications.forEach(notif => listener(notif));
            }
          });
        };

        socket.on('connect', handleSync);

        const readListener = createNotificationReadListener(arg.channelId, arg.userId, (cb) => {
          updateCachedData((draft) => cb(draft.items));
        });
        const deliveredListener = createNotificationDeliveredListener(arg.channelId, arg.userId, (cb) => {
          updateCachedData((draft) => cb(draft.items));
        });

        await bindSocketToCache({
          socket,
          cacheDataLoaded,
          cacheEntryRemoved,
          listeners: {
            [SocketEvent.RECEIVE_NOTIFICATION]: listener,
            [SocketEvent.CHANNEL_READ]: readListener,
            [SocketEvent.NOTIFICATION_READ]: readListener,
            [SocketEvent.NOTIFICATION_DELIVERED]: deliveredListener,
            [SocketEvent.NOTIFICATION_DELETED]: createNotificationDeletedListener(arg.channelId, (cb) => {
              updateCachedData((draft) => cb(draft.items));
            }),
          },
          onCleanup: () => {
            socket.off('connect', handleSync);
          },
        });
      },
    }),
    loadMoreHistory: build.mutation<{ items: Notification[]; hasMore: boolean }, { userId: string; channelId: string; beforeSequence: number; query?: string }>({
      query: ({ channelId, beforeSequence, query }) => ({
        url: query
          ? `${ApiRoutes.notifications.history(channelId)}?limit=30&beforeSequence=${beforeSequence}&query=${encodeURIComponent(query)}`
          : `${ApiRoutes.notifications.history(channelId)}?limit=30&beforeSequence=${beforeSequence}`,
      }),
      async onQueryStarted({ userId, channelId, query }, { dispatch, getState, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const state = getState() as RootState;

          updateMatchingHistoryQueries(state, dispatch, channelId, userId, query, (draft: any) => {
            if (!draft || !draft.items) return;

            const existingIds = new Set(draft.items.map((item: any) => item.id));
            const newItems = data.items.filter((item: any) => !existingIds.has(item.id));

            draft.items.unshift(...newItems);
            draft.hasMore = data.hasMore;
          });
        } catch { }
      },
    }),
    sendNotification: build.mutation<{ success: boolean; status: 'sent' | 'queued'; notification?: Notification }, { senderId: string; channelId: string; notification: string; clientNotificationId?: string; priority?: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE'; parentNotificationId?: string; attachments?: string[] }>({
      query: ({ senderId, channelId, notification, clientNotificationId, priority, parentNotificationId, attachments }) => ({
        url: ApiRoutes.notifications.send(senderId),
        method: 'POST',
        body: { channelId, text: notification, clientNotificationId: clientNotificationId || generateId(), priority, parentNotificationId, attachments },
      }),
      async onQueryStarted({ senderId, channelId, notification, clientNotificationId, priority, parentNotificationId, attachments }, { dispatch, getState, queryFulfilled }) {
        if (!channelId) return;

        const optimisticId = `temp-${Date.now()}`;
        const finalClientNotificationId = clientNotificationId || optimisticId;
        const finalPriority = parentNotificationId ? 'NONE' : (priority || 'MEDIUM');

        // Apply optimistic update to all active history queries matching this channel
        updateHistoryCacheForChannel(dispatch, getState, senderId, channelId, (draft: any) => {
          if (!draft || !draft.items) return;
          const index = draft.items.findIndex((x: any) => x.clientNotificationId === finalClientNotificationId);
          if (index !== -1) {
            draft.items[index].isSending = true;
            draft.items[index].status = 'PENDING';
          } else {
            draft.items.push({
              id: optimisticId,
              senderId,
              channelId,
              text: notification,
              sequence: 0,
              status: 'PENDING',
              createdAt: new Date().toISOString(),
              isSending: true,
              clientNotificationId: finalClientNotificationId,
              priority: finalPriority,
              parentNotificationId,
              attachments,
            });
          }
        });

        try {
          const { data } = await queryFulfilled;
          if (data?.notification) {
            updateHistoryCacheForChannel(dispatch, getState, senderId, channelId, (draft: any) => {
              if (!draft || !draft.items) return;
              const itemIndex = draft.items.findIndex((x: any) => x.clientNotificationId === finalClientNotificationId);
              if (itemIndex !== -1) {
                draft.items.splice(itemIndex, 1);
              }
              const existingIndex = draft.items.findIndex((x: any) => x.id === data.notification!.id);
              if (existingIndex === -1) {
                draft.items.push(data.notification);
              }
            });
          }
        } catch (err: any) {
          console.error('[sendNotification] Error caught:', err);

          const errorStatus = err?.error?.status || err?.status;
          const isNetworkError =
            !navigator.onLine ||
            errorStatus === 'FETCH_ERROR' ||
            errorStatus === 502 ||
            errorStatus === 503 ||
            errorStatus === 504 ||
            err?.message === 'Failed to fetch' ||
            err?.error?.message === 'Failed to fetch' ||
            err?.error?.error?.includes('Failed to fetch');

          // Always preserve the unsent message in the UI feed so the user does not lose it
          updateHistoryCacheForChannel(dispatch, getState, senderId, channelId, (draft: any) => {
            if (!draft || !draft.items) return;
            const item = draft.items.find((x: any) => x.clientNotificationId === finalClientNotificationId);
            if (item) {
              item.isSending = false;
              item.status = 'FAILED_OFFLINE';
            }
          });

          // Only queue for automatic background retry if it is a connectivity failure
          if (isNetworkError) {
            addToOfflineQueue({
              senderId,
              channelId,
              notification,
              clientNotificationId: finalClientNotificationId,
              priority,
              parentNotificationId,
              attachments,
            });
          }
        }
      },
      invalidatesTags: ['Channels'],
    }),
    markAsRead: build.mutation<void, { userId: string; notificationId: string }>({
      queryFn: (arg, { getState }) => {
        const state = getState() as RootState;
        const accessToken = state.user.accessToken;
        const socket = getSocket(arg.userId, accessToken);
        socket.emit(SocketEvent.READ, { notificationId: arg.notificationId });
        return { data: undefined };
      },
    }),
    markAllAsRead: build.mutation<void, { userId: string; channelId: string }>({
      query: ({ userId, channelId }) => ({
        url: ApiRoutes.notifications.readAll(channelId, userId),
        method: 'POST',
      }),
      async onQueryStarted({ userId, channelId }, { dispatch, queryFulfilled }) {
        if (!channelId) return;

        const patchResult = dispatch(
          (baseApi.util as any).updateQueryData('getChannels', userId, (draft: any) => {
            const channel = draft.find((c: any) => c.channelId === channelId);
            if (channel) channel.unreadCount = 0;
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
    deleteNotification: build.mutation<void, string>({
      query: (id) => ({
        url: `${ApiRoutes.notifications.base}/${id}`,
        method: 'DELETE',
      }),
    }),
  }),
});

export const {
  useGetHistoryQuery,
  useSendNotificationMutation,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useLoadMoreHistoryMutation,
  useDeleteNotificationMutation,
} = notificationsApi;

export const notificationApi = notificationsApi;
