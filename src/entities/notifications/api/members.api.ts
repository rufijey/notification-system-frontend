import { baseApi } from '@/shared/api/base';
import { getSocket } from '@/shared/lib/socket';
import { type RootState } from '@/app/providers/store';
import type { ChannelMember } from '../model/types';
import { SocketEvent } from '../model/constants';
import { ApiRoutes } from '@/shared/config';
import { bindSocketToCache } from '../lib/socket-cache-binder';

export const membersApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getChannelMembers: build.query<ChannelMember[], string>({
      query: (channelId) => ({ url: ApiRoutes.channels.members(channelId) }),
      providesTags: (_result, _error, channelId) => [{ type: 'Members', id: channelId }],
      async onCacheEntryAdded(
        arg,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved, getState }
      ) {
        const state = getState() as RootState;
        const userId = state.user.currentUserId;
        const accessToken = state.user.accessToken;
        if (!userId || !accessToken) return;

        const socket = getSocket(userId, accessToken);

        const listener = (payload: { channelId: string; userId: string; role: 'ADMIN' | 'PUBLISHER' | 'SUBSCRIBER' }) => {
          if (payload.channelId !== arg) return;
          updateCachedData((draft) => {
            const member = draft.find(m => m.userId === payload.userId);
            if (member) {
              member.role = payload.role;
            }
          });
        };

        await bindSocketToCache({
          socket,
          cacheDataLoaded,
          cacheEntryRemoved,
          listeners: {
            [SocketEvent.CHANNEL_UPDATED]: listener,
          },
        });
      },
    }),
    updateMemberRole: build.mutation<void, { channelId: string; userId: string; role: 'ADMIN' | 'PUBLISHER' | 'SUBSCRIBER' }>({
      query: ({ channelId, userId, role }) => ({
        url: ApiRoutes.channels.roleUpdate(channelId, userId),
        method: 'POST',
        body: { role },
      }),
      invalidatesTags: (_result, _error, { channelId }) => [{ type: 'Members', id: channelId }],
    }),
    inviteUser: build.mutation<void, { channelId: string; memberId: string }>({
      query: ({ channelId, memberId }) => ({
        url: ApiRoutes.channels.members(channelId),
        method: 'POST',
        body: { memberId },
      }),
      invalidatesTags: ['Channels'],
    }),
    leaveChannel: build.mutation<void, { channelId: string }>({
      query: ({ channelId }) => ({
        url: ApiRoutes.channels.members(channelId),
        method: 'DELETE',
      }),
      invalidatesTags: ['Channels'],
    }),
  }),
});

export const {
  useGetChannelMembersQuery,
  useUpdateMemberRoleMutation,
  useInviteUserMutation,
  useLeaveChannelMutation,
} = membersApi;
