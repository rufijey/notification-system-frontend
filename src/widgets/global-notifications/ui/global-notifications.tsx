import { useState, useEffect } from 'react';
import {
  useGetGlobalNotificationsQuery,
  useLoadMoreGlobalNotificationsMutation,
} from '@/entities/notifications/api';
import { GlobalNotificationsHeader } from './components/global-notifications-header';
import { GlobalNotificationsControlBar } from './components/global-notifications-control-bar';
import { GlobalNotificationsList } from './components/global-notifications-list';

interface GlobalNotificationsProps {
  onNavigateToChannel: (channelId: string) => void;
  onBackClick?: () => void;
}

export const GlobalNotifications = ({ onNavigateToChannel, onBackClick }: GlobalNotificationsProps) => {
  const [searchVal, setSearchVal] = useState('');
  const [debouncedSearchVal, setDebouncedSearchVal] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchVal(searchVal);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchVal]);

  const {
    data: notificationsData,
    isLoading,
  } = useGetGlobalNotificationsQuery(debouncedSearchVal);

  const [loadMore, { isLoading: isMoreLoading }] = useLoadMoreGlobalNotificationsMutation();

  const notifications = notificationsData?.items ?? [];
  const hasMore = notificationsData?.hasMore ?? false;

  const [priorityFilter, setPriorityFilter] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');

  const handleLoadMore = async () => {
    if (notifications.length === 0 || isMoreLoading) return;
    const lastItem = notifications[notifications.length - 1];
    try {
      await loadMore({ beforeId: lastItem.id, query: debouncedSearchVal }).unwrap();
    } catch (err) {
      console.error('Failed to load more notifications:', err);
    }
  };

  const filteredNotifications = notifications.filter((notif) => {
    return priorityFilter === 'ALL' || notif.priority === priorityFilter;
  });

  // Group notifications into Unread (New) vs Read (Earlier)
  const unreadNotifications = filteredNotifications.filter((notif) => {
    const lastRead = (notif.channel as any)?.members?.[0]?.lastReadSequence ?? 0;
    return notif.sequence > lastRead;
  });

  const readNotifications = filteredNotifications.filter((notif) => {
    const lastRead = (notif.channel as any)?.members?.[0]?.lastReadSequence ?? 0;
    return notif.sequence <= lastRead;
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-neutral-950 text-white">
      <GlobalNotificationsHeader onBackClick={onBackClick} />

      <GlobalNotificationsControlBar
        searchVal={searchVal}
        setSearchVal={setSearchVal}
        priorityFilter={priorityFilter}
        setPriorityFilter={setPriorityFilter}
      />

      <GlobalNotificationsList
        isLoading={isLoading}
        isMoreLoading={isMoreLoading}
        hasMore={hasMore}
        unreadNotifications={unreadNotifications}
        readNotifications={readNotifications}
        filteredNotificationsCount={filteredNotifications.length}
        onLoadMore={handleLoadMore}
        onNavigateToChannel={onNavigateToChannel}
      />
    </div>
  );
};
