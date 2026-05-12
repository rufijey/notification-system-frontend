import { Inbox, RefreshCw } from 'lucide-react';
import { Loader } from '@/shared';
import { GlobalNotificationCard } from './global-notification-card';

interface NotificationItem {
  id: string;
  channelId: string;
  senderId: string;
  text: string;
  sequence: number;
  createdAt: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
  channel?: {
    members?: { lastReadSequence: number }[];
  };
}

interface GlobalNotificationsListProps {
  isLoading: boolean;
  isMoreLoading: boolean;
  hasMore: boolean;
  unreadNotifications: NotificationItem[];
  readNotifications: NotificationItem[];
  filteredNotificationsCount: number;
  onLoadMore: () => void;
  onNavigateToChannel: (channelId: string) => void;
}

export const GlobalNotificationsList = ({
  isLoading,
  isMoreLoading,
  hasMore,
  unreadNotifications,
  readNotifications,
  filteredNotificationsCount,
  onLoadMore,
  onNavigateToChannel,
}: GlobalNotificationsListProps) => {
  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-6 flex items-center justify-center">
        <Loader size="md" />
      </div>
    );
  }

  if (filteredNotificationsCount === 0) {
    return (
      <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center text-neutral-500 py-12">
        <div className="w-12 h-12 rounded-full bg-neutral-900/20 flex items-center justify-center mb-3">
          <Inbox size={24} className="text-neutral-500" />
        </div>
        <p className="font-semibold text-white">All Clear</p>
        <p className="text-xs text-neutral-500 mt-1">
          No alerts matching your filter were found
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* 1. New Alerts Section */}
        {unreadNotifications.length > 0 && (
          <div className="space-y-3.5">
            <div className="flex items-center gap-2 px-1">
              <div className="h-2 w-2 rounded-full bg-violet-500 animate-ping" />
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-violet-400 flex items-center gap-1.5">
                New Alerts
                <span className="bg-violet-500/10 text-violet-400 px-1.5 py-0.5 rounded-full text-[9px] font-black border border-violet-500/10">
                  {unreadNotifications.length}
                </span>
              </span>
              <div className="flex-1 h-[1px] bg-gradient-to-r from-violet-500/10 via-neutral-900/20 to-transparent ml-2" />
            </div>

            <div className="space-y-3">
              {unreadNotifications.map((notif) => (
                <GlobalNotificationCard
                  key={notif.id}
                  notification={notif}
                  isUnread={true}
                  onNavigateToChannel={onNavigateToChannel}
                />
              ))}
            </div>
          </div>
        )}

        {/* 2. Earlier Alerts Section */}
        {readNotifications.length > 0 && (
          <div className="space-y-3.5">
            <div className="flex items-center gap-2 px-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-500 flex items-center gap-1.5">
                Earlier
              </span>
              <div className="flex-1 h-[1px] bg-gradient-to-r from-neutral-900/40 via-neutral-950 to-transparent ml-2" />
            </div>

            <div className="space-y-3 opacity-75">
              {readNotifications.map((notif) => (
                <GlobalNotificationCard
                  key={notif.id}
                  notification={notif}
                  isUnread={false}
                  onNavigateToChannel={onNavigateToChannel}
                />
              ))}
            </div>
          </div>
        )}

        {hasMore && (
          <div className="flex justify-center pt-6 pb-12">
            <button
              onClick={onLoadMore}
              disabled={isMoreLoading}
              className="px-6 py-2.5 bg-neutral-900/60 hover:bg-neutral-900 text-xs font-bold text-violet-400 hover:text-violet-300 rounded-xl border border-neutral-800/80 hover:border-violet-500/30 shadow-lg hover:shadow-violet-500/[0.03] transition-all duration-300 disabled:opacity-50 flex items-center gap-2.5 cursor-pointer active:scale-[0.98] group"
            >
              {isMoreLoading ? (
                <>
                  <span className="animate-spin rounded-full h-3.5 w-3.5 border-t-2 border-b-2 border-violet-400 mr-1" />
                  Loading Alerts...
                </>
              ) : (
                <>
                  <span>Load More Alerts</span>
                  <RefreshCw
                    size={12}
                    className="text-violet-500 group-hover:rotate-180 transition-transform duration-500"
                  />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
