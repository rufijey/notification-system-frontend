import { baseApi } from '@/shared/api/base';
import { SocketEvent } from '@/entities/notifications/model/constants';

export interface ChannelReport {
  id: string;
  channelId: string;
  channelTitle: string;
  reporterId: string;
  reporterUsername: string;
  reason: string;
  createdAt: string;
}

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getReports: builder.query<ChannelReport[], void>({
      query: () => '/admin/reports',
      providesTags: ['Reports'],
      async onCacheEntryAdded(
        _arg,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved, getState }
      ) {
        try {
          await cacheDataLoaded;
          const state = getState() as any;
          const accessToken = state.user?.accessToken;
          const userId = state.user?.currentUserId;
          
          if (!accessToken || !userId) return;

          const { getSocket } = await import('@/shared/lib/socket');
          const socket = getSocket(userId, accessToken, () => []);

          const handleReportCreated = (report: ChannelReport) => {
            console.log('[AdminAPI] Real-time report created:', report);
            updateCachedData((draft) => {
              if (!draft.find(r => r.id === report.id)) {
                draft.unshift(report);
              }
            });
          };

          const handleReportDismissed = ({ id }: { id: string }) => {
            console.log('[AdminAPI] Real-time report dismissed:', id);
            updateCachedData((draft) => {
              const index = draft.findIndex(r => r.id === id);
              if (index !== -1) draft.splice(index, 1);
            });
          };

          socket.on(SocketEvent.ADMIN_REPORT_CREATED, handleReportCreated);
          socket.on(SocketEvent.ADMIN_REPORT_DISMISSED, handleReportDismissed);

          await cacheEntryRemoved;
          socket.off(SocketEvent.ADMIN_REPORT_CREATED, handleReportCreated);
          socket.off(SocketEvent.ADMIN_REPORT_DISMISSED, handleReportDismissed);
        } catch (err) {
          console.error('Admin real-time error (reports):', err);
        }
      }
    }),
    banChannel: builder.mutation<void, { channelId: string; reason: string; durationDays?: number }>({
      query: (data) => ({
        url: '/admin/ban',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Channels', 'Reports'],
    }),
    reportChannel: builder.mutation<void, { channelId: string; reason: string }>({
      query: (data) => ({
        url: '/admin/report',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Reports'],
    }),
    dismissReport: builder.mutation<void, string>({
      query: (id) => ({
        url: `/admin/reports/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Reports'],
    }),
    getBannedChannels: builder.query<any[], void>({
      query: () => '/admin/bans',
      providesTags: ['Bans'],
      async onCacheEntryAdded(
        _arg,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved, getState }
      ) {
        try {
          await cacheDataLoaded;
          const state = getState() as any;
          const accessToken = state.user?.accessToken;
          const userId = state.user?.currentUserId;
          
          if (!accessToken || !userId) return;

          const { getSocket } = await import('@/shared/lib/socket');
          const socket = getSocket(userId, accessToken, () => []);

          const handleChannelBanned = (ban: any) => {
            updateCachedData((draft) => {
              if (!draft.find(b => b.id === ban.id)) {
                draft.unshift(ban);
              }
            });
          };

          const handleChannelUnbanned = ({ id }: { id: string }) => {
            updateCachedData((draft) => {
              const index = draft.findIndex(b => b.id === id);
              if (index !== -1) draft.splice(index, 1);
            });
          };

          socket.on(SocketEvent.ADMIN_CHANNEL_BANNED, handleChannelBanned);
          socket.on(SocketEvent.ADMIN_CHANNEL_UNBANNED, handleChannelUnbanned);

          await cacheEntryRemoved;
          socket.off(SocketEvent.ADMIN_CHANNEL_BANNED, handleChannelBanned);
          socket.off(SocketEvent.ADMIN_CHANNEL_UNBANNED, handleChannelUnbanned);
        } catch (err) {
          console.error('Admin real-time error (bans):', err);
        }
      }
    }),
    unbanChannel: builder.mutation<void, { banId: string }>({
      query: (body) => ({
        url: '/admin/unban',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Bans', 'Reports'],
    }),
  }),
});

export const {
  useGetReportsQuery,
  useBanChannelMutation,
  useReportChannelMutation,
  useDismissReportMutation,
  useGetBannedChannelsQuery,
  useUnbanChannelMutation,
} = adminApi;
