import { baseApi } from '@/shared/api/base';
import { getSocket } from '@/shared/lib/socket';
import { type RootState } from '@/app/providers/store';
import type { Channel, NotificationCursor } from '../model/types';
import { SocketEvent } from '../model/constants';
import { initActivityTracking } from '../lib/activity';
import { ApiRoutes } from '@/shared/config';
import { bindSocketToCache } from '../lib/socket-cache-binder';
import {
  createChannelListListener,
  createChannelJoinedListener,
  createChannelReadListener,
  createMessageReadListener,
  createChannelUpdatedListener
} from '../lib/listeners';

export const channelsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getChannels: build.query<Channel[], string>({
      query: (userId) => ({ url: ApiRoutes.channels.list(userId) }),
      providesTags: ['Channels'],
      async onCacheEntryAdded(
        arg,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved, getState }
      ) {
        const state = getState() as RootState;
        const accessToken = state.user.accessToken;

        const getCursors = (): NotificationCursor[] => {
          const apiState = (getState() as any)[baseApi.reducerPath];
          const queryKey = `getChannels("${arg}")`;
          const currentChannels = apiState.queries[queryKey]?.data as Channel[] | undefined;
          return (currentChannels || []).map(c => ({ channelId: c.channelId, lastKnownSequence: c.lastReadSequence }));
        };

        const socket = getSocket(arg, accessToken, getCursors);

        const cleanupActivity = initActivityTracking(socket);

        await bindSocketToCache({
          socket,
          cacheDataLoaded,
          cacheEntryRemoved,
          listeners: {
            [SocketEvent.RECEIVE_NOTIFICATION]: createChannelListListener(arg, updateCachedData, socket),
            [SocketEvent.CHANNEL_READ]: createChannelReadListener(arg, updateCachedData),
            [SocketEvent.NOTIFICATION_READ]: createMessageReadListener(arg, updateCachedData),
            [SocketEvent.CHANNEL_JOINED]: createChannelJoinedListener(updateCachedData),
            [SocketEvent.CHANNEL_UPDATED]: createChannelUpdatedListener(arg, updateCachedData),
          },
          onCleanup: cleanupActivity,
        });
      },
    }),
    createChannel: build.mutation<Channel, { userId: string; memberIds: string[]; title?: string; id?: string }>({
      query: ({ userId, ...body }) => ({
        url: ApiRoutes.channels.create(userId),
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Channels'],
    }),
    joinChannel: build.mutation<void, { userId: string; channelId: string }>({
      query: ({ channelId, userId }) => ({
        url: ApiRoutes.channels.join(channelId, userId),
        method: 'POST',
      }),
      invalidatesTags: ['Channels'],
    }),
    searchChannels: build.query<{ channelId: string; title: string; isMember: boolean }[], string>({
      query: (query) => ({
        url: ApiRoutes.channels.search(query),
      }),
    }),
    getChannelDetails: build.query<{ channelId: string; title: string; memberCount: number }, string>({
      query: (channelId) => ({ url: ApiRoutes.channels.details(channelId) }),
    }),
  }),
});

export const {
  useGetChannelsQuery,
  useCreateChannelMutation,
  useJoinChannelMutation,
  useSearchChannelsQuery,
  useGetChannelDetailsQuery,
} = channelsApi;
