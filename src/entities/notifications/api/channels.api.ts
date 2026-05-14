import { baseApi } from '@/shared/api/base';
import { getSocket } from '@/shared/lib/socket';
import type { RootState } from '@/app/providers/store';
import type { Channel, NotificationCursor } from '../model/types';
import { SocketEvent } from '../model/constants';
import * as crypto from '@/shared/lib/crypto';
import { cryptoService } from '@/shared/lib/crypto-service';
import { userApi } from '@/entities/user/api/user.api';
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
      transformResponse: async (response: Channel[], meta, arg) => {
        // We can't easily use cryptoService here because it's not a hook and we don't have access to the store
        // But getChannels is called when the user is logged in.
        // Actually, it's better to decrypt in the UI or in onCacheEntryAdded using updateCachedData.
        return response;
      },
      async onCacheEntryAdded(
        arg,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved, getState }
      ) {
        const { data: channels } = await cacheDataLoaded;
        const state = getState() as RootState;
        const currentUserId = state.user.currentUserId;

        // Initialize keys for all encrypted channels and decrypt last messages
        if (currentUserId) {
          channels.forEach(async (channel) => {
            if (channel.isEncrypted && channel.encryptedKey && channel.lastNotification) {
              await cryptoService.getChannelKey(channel.channelId, channel.encryptedKey);
              const decryptedText = await cryptoService.decryptMessage(channel.channelId, channel.lastNotification);
              
              updateCachedData((draft) => {
                const draftChannel = draft.find(c => c.channelId === channel.channelId);
                if (draftChannel) {
                  draftChannel.lastNotification = decryptedText;
                }
              });
            } else if (channel.isEncrypted && channel.encryptedKey) {
              cryptoService.getChannelKey(channel.channelId, channel.encryptedKey);
            }
          });
        }

        const accessToken = state.user.accessToken;

        const socket = getSocket(arg, accessToken);

        const getCursors = (): NotificationCursor[] => {
          const apiState = (getState() as any)[baseApi.reducerPath];
          const queryKey = `getChannels("${arg}")`;
          const currentChannels = apiState.queries[queryKey]?.data as Channel[] | undefined;
          return (currentChannels || []).map(c => ({ channelId: c.channelId, lastKnownSequence: c.lastNotificationSequence || c.lastReadSequence || 0 }));
        };

        const baseChannelListListener = createChannelListListener(arg, updateCachedData, socket);

        const channelListListener = async (notification: any) => {
          const currentState = getState() as RootState;
          const channels = (currentState.api.queries[`getChannels("${arg}")`]?.data as any[]) || [];
          const channel = channels.find(c => c.channelId === notification.channelId);

          let decryptedNotification = notification;
          if (channel?.isEncrypted) {
            const decryptedText = await cryptoService.decryptMessage(notification.channelId, notification.text);
            decryptedNotification = { ...notification, text: decryptedText };
          }
          baseChannelListListener(decryptedNotification);
        };

        const handleSync = () => {
          const cursors = getCursors();
          if (cursors.length === 0) return;

          const syncRequests = cursors.map(c => ({
            channelId: c.channelId,
            lastSequence: c.lastKnownSequence
          }));

          socket.emit(SocketEvent.SYNC_NOTIFICATIONS, { syncRequests }, (response: { notifications?: any[] }) => {
            if (response?.notifications && Array.isArray(response.notifications)) {
              console.log(`[Sync] Processing ${response.notifications.length} missed notifications for channel list`);
              response.notifications.forEach(notif => {
                channelListListener(notif);
              });
            }
          });
        };

        socket.on('connect', handleSync);

        const cleanupActivity = initActivityTracking(socket);

        await bindSocketToCache({
          socket,
          cacheDataLoaded,
          cacheEntryRemoved,
          listeners: {
            [SocketEvent.RECEIVE_NOTIFICATION]: channelListListener,
            [SocketEvent.CHANNEL_READ]: createChannelReadListener(arg, updateCachedData),
            [SocketEvent.NOTIFICATION_READ]: createMessageReadListener(arg, updateCachedData),
            [SocketEvent.CHANNEL_JOINED]: createChannelJoinedListener(updateCachedData),
            [SocketEvent.CHANNEL_UPDATED]: createChannelUpdatedListener(arg, updateCachedData),
          },
          onCleanup: () => {
            cleanupActivity();
            socket.off('connect', handleSync);
          },
        });
      },
    }),
    createChannel: build.mutation<Channel, { userId: string; memberIds: string[]; title?: string; id?: string; photoUrl?: string; isEncrypted?: boolean }>({
      queryFn: async (arg, api, extraOptions, baseQuery) => {
        const { userId, memberIds, title, id, photoUrl, isEncrypted } = arg;
        let encryptedKeys: Record<string, string> | undefined = undefined;

        if (isEncrypted) {
          try {
            // 1. Generate AES key for the channel
            const aesKey = await crypto.generateChannelKey();
            const aesKeyBase64 = await crypto.exportAESKey(aesKey);

            // 2. Fetch public keys of all members
            const allMembers = Array.from(new Set([...memberIds, userId]));
            const publicKeysResult = await api.dispatch(userApi.endpoints.getPublicKeys.initiate(allMembers)).unwrap();

            // 3. Encrypt AES key for each member
            encryptedKeys = {};
            for (const memberId of allMembers) {
              const pubKeyBase64 = publicKeysResult[memberId];
              if (pubKeyBase64) {
                const pubKey = await crypto.importPublicKey(pubKeyBase64);
                encryptedKeys[memberId] = await crypto.encryptWithPublicKey(pubKey, aesKeyBase64);
              }
            }

            // 4. Pre-cache the channel key in cryptoService so we don't have to decrypt it later
            // We'll need the channel ID, which we'll get from the response
          } catch (e) {
            console.error('Encryption failed during channel creation:', e);
            return { error: { status: 500, data: 'Encryption failed' } as any };
          }
        }

        const result = await baseQuery({
          url: ApiRoutes.channels.create(userId),
          method: 'POST',
          body: { memberIds, title, id, photoUrl, isEncrypted, encryptedKeys },
        });

        if (result.data && isEncrypted) {
          // Cache the key for the newly created channel
          const channel = result.data as Channel;
          // We already have the aesKey from step 1, but we need to store it
          // For simplicity, we'll let the cryptoService decrypt it from the member's encryptedKey on next access
          // Or we could pass it to cryptoService here.
        }

        return result as { data: Channel };
      },
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
    getChannelDetails: build.query<{ channelId: string; title: string; memberCount: number; photoUrl?: string; isBanned?: boolean }, string>({
      query: (channelId) => ({ url: ApiRoutes.channels.details(channelId) }),
      providesTags: ['Channels'],
      async onCacheEntryAdded(
        arg,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved, getState }
      ) {
        try {
          await cacheDataLoaded;
          const state = getState() as RootState;
          const accessToken = state.user.accessToken;
          const userId = state.user.currentUserId;

          if (!accessToken || !userId) return;

          const socket = getSocket(userId, accessToken);

          const handleBanned = (payload: any) => {
            if (payload.channelId === arg) {
              updateCachedData((draft) => {
                draft.isBanned = true;
              });
            }
          };

          const handleUnbanned = (payload: any) => {
            if (payload.channelId === arg) {
              updateCachedData((draft) => {
                draft.isBanned = false;
              });
            }
          };

          socket.on(SocketEvent.ADMIN_CHANNEL_BANNED, handleBanned);
          socket.on(SocketEvent.ADMIN_CHANNEL_UNBANNED, handleUnbanned);

          await cacheEntryRemoved;
          socket.off(SocketEvent.ADMIN_CHANNEL_BANNED, handleBanned);
          socket.off(SocketEvent.ADMIN_CHANNEL_UNBANNED, handleUnbanned);
        } catch (err) {
          console.error('Channel details real-time error:', err);
        }
      },
    }),
    renameChannel: build.mutation<void, { channelId: string; title?: string; photoUrl?: string }>({
      query: ({ channelId, title, photoUrl }) => ({
        url: ApiRoutes.channels.rename(channelId),
        method: 'PATCH',
        body: { title, photoUrl },
      }),
      invalidatesTags: ['Channels'],
    }),
  }),
});

export const {
  useGetChannelsQuery,
  useCreateChannelMutation,
  useJoinChannelMutation,
  useSearchChannelsQuery,
  useGetChannelDetailsQuery,
  useRenameChannelMutation,
} = channelsApi;
