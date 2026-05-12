import { baseApi } from '@/shared/api/base';
import { getSocket } from '@/shared/lib/socket';
import { type RootState } from '@/app/providers/store';
import { SocketEvent } from '../model/constants';
import { ApiRoutes } from '@/shared/config';
import { bindSocketToCache } from '../lib/socket-cache-binder';
import {
  createGlobalNotificationListener,
  createGlobalChannelReadListener,
} from '../lib/listeners';

export const globalNotificationsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getGlobalNotifications: build.query<{ items: any[]; hasMore: boolean }, string | void>({
      query: (searchQuery) => ({
        url: searchQuery
          ? `${ApiRoutes.notifications.global}?limit=30&query=${encodeURIComponent(searchQuery)}`
          : `${ApiRoutes.notifications.global}?limit=30`,
      }),
      providesTags: ['History'],
      async onCacheEntryAdded(
        searchQuery,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved, getState }
      ) {
        const state = getState() as RootState;
        const currentUserId = state.user.currentUserId;
        const accessToken = state.user.accessToken;

        if (!currentUserId) return;

        const socket = getSocket(currentUserId, accessToken);

        const notificationListener = createGlobalNotificationListener(
          currentUserId,
          (cb) => {
            updateCachedData((draft) => {
              cb(draft.items);
            });
          },
          searchQuery || undefined
        );
        const channelReadListener = createGlobalChannelReadListener(currentUserId, (cb) => {
          updateCachedData((draft) => {
            cb(draft.items);
          });
        });

        await bindSocketToCache({
          socket,
          cacheDataLoaded,
          cacheEntryRemoved,
          listeners: {
            [SocketEvent.RECEIVE_NOTIFICATION]: notificationListener,
            [SocketEvent.CHANNEL_READ]: channelReadListener,
          },
        });
      },
    }),
    loadMoreGlobalNotifications: build.mutation<{ items: any[]; hasMore: boolean }, { beforeId: string; query?: string }>({
      query: ({ beforeId, query }) => ({
        url: query
          ? `${ApiRoutes.notifications.global}?limit=30&beforeId=${beforeId}&query=${encodeURIComponent(query)}`
          : `${ApiRoutes.notifications.global}?limit=30&beforeId=${beforeId}`,
      }),
      async onQueryStarted({ query }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            (baseApi.util as any).updateQueryData('getGlobalNotifications', query || '', (draft: any) => {
              draft.items.push(...data.items);
              draft.hasMore = data.hasMore;
            })
          );
        } catch { }
      },
    }),
  }),
});

export const {
  useGetGlobalNotificationsQuery,
  useLoadMoreGlobalNotificationsMutation,
} = globalNotificationsApi;
