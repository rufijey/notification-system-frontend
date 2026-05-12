import { useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import { Loader } from '@/shared';
import { NotificationBubble, ReadStatusTracker } from '@/entities/notifications';
import type { Notification, ChannelMember } from '../../../../entities/notifications/model/types';

interface MessageFeedProps {
  userId: string;
  channelId: string;
  isActive: boolean;
  notifications: Notification[];
  displayedNotifications: Notification[];
  hasMore: boolean;
  isHistoryLoading: boolean;
  isLoadingMore: boolean;
  loadMoreHistory: (arg: { userId: string; channelId: string; beforeSequence: number; query?: string }) => any;
  activeThreadId: string | null;
  setActiveThreadId: (id: string | null) => void;
  activeParentNotification: Notification | null;
  members: ChannelMember[];
  query?: string;
  highlightMessageId?: string | null;
}

export const MessageFeed = ({
  userId,
  channelId,
  isActive,
  notifications,
  displayedNotifications,
  hasMore,
  isHistoryLoading,
  isLoadingMore,
  loadMoreHistory,
  activeThreadId,
  setActiveThreadId,
  activeParentNotification,
  members,
  query,
  highlightMessageId,
}: MessageFeedProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const topSentinelRef = useRef<HTMLDivElement>(null);
  const isLoadingMoreRef = useRef(false);
  const initialScrollDone = useRef(false);

  // Refs for tracking scroll size and positions for perfect infinite scroll restoration
  const lastScrollHeightRef = useRef<number>(0);
  const lastScrollTopRef = useRef<number>(0);
  const shouldAdjustScrollRef = useRef<boolean>(false);
  const prevLastNotificationIdRef = useRef<string | null>(null);

  // Scroll to bottom on initial load, thread switch, and subsequent new messages
  const lastNotificationId = displayedNotifications[displayedNotifications.length - 1]?.id;

  // Update the tracked last message ID after all render effects have processed
  useEffect(() => {
    if (lastNotificationId) {
      prevLastNotificationIdRef.current = lastNotificationId;
    }
  }, [lastNotificationId]);

  // Scroll to highlighted message
  useEffect(() => {
    if (highlightMessageId) {
      const el = document.getElementById(`msg-${highlightMessageId}`);
      if (el) {
        const timer = setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 200);
        return () => clearTimeout(timer);
      }
    }
  }, [highlightMessageId, displayedNotifications]);

  // 1. Synchronous scroll-to-bottom for own messages to prevent layout flicker (jerk) before paint
  useLayoutEffect(() => {
    if (isHistoryLoading || !lastNotificationId || !scrollRef.current) return;

    if (!initialScrollDone.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      initialScrollDone.current = true;
      return;
    }

    // Only scroll to bottom if a brand new message was appended and we are not highlighting a search result
    const isNewMessage = prevLastNotificationIdRef.current !== lastNotificationId;
    if (isNewMessage && !highlightMessageId) {
      const isLastMessageMe = displayedNotifications[displayedNotifications.length - 1]?.senderId === userId;
      if (isLastMessageMe) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }
  }, [isHistoryLoading, lastNotificationId, highlightMessageId, userId, displayedNotifications]);

  // 2. Smooth scroll-to-bottom for other users' messages
  useEffect(() => {
    if (isHistoryLoading || !lastNotificationId || !scrollRef.current) return;

    // Only scroll to bottom if a brand new message was appended and we are not highlighting a search result
    const isNewMessage = prevLastNotificationIdRef.current !== lastNotificationId;
    if (isNewMessage && !highlightMessageId) {
      const isLastMessageMe = displayedNotifications[displayedNotifications.length - 1]?.senderId === userId;
      if (!isLastMessageMe) {
        const timer = setTimeout(() => {
          if (scrollRef.current) {
            scrollRef.current.scrollTo({
              top: scrollRef.current.scrollHeight,
              behavior: 'smooth',
            });
          }
        }, 50);
        return () => clearTimeout(timer);
      }
    }
  }, [isHistoryLoading, lastNotificationId, highlightMessageId, userId, displayedNotifications]);

  // Keep scroll anchored to bottom on resize (e.g. when textarea auto-grows/shrinks or keyboard opens)
  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;

    let lastHeight = scrollEl.clientHeight;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const newHeight = entry.target.clientHeight;
        const heightDifference = lastHeight - newHeight;

        if (Math.abs(heightDifference) > 0) {
          // If the user was scrolled near the bottom (within 120px)
          const isAtBottom = scrollEl.scrollHeight - scrollEl.scrollTop - lastHeight < 120;
          if (isAtBottom) {
            scrollEl.scrollTop = scrollEl.scrollHeight;
          }
        }
        lastHeight = newHeight;
      }
    });

    resizeObserver.observe(scrollEl);
    return () => resizeObserver.disconnect();
  }, []);

  // Synchronous scroll-restoration for prepended history updates
  useLayoutEffect(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl || !shouldAdjustScrollRef.current) return;

    const heightDifference = scrollEl.scrollHeight - lastScrollHeightRef.current;
    if (heightDifference > 0) {
      scrollEl.scrollTop = lastScrollTopRef.current + heightDifference;
      shouldAdjustScrollRef.current = false;
    }
  }, [notifications]);

  // Capture current scroll positions during active user scrolling
  const handleScroll = useCallback(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;

    if (!shouldAdjustScrollRef.current) {
      lastScrollHeightRef.current = scrollEl.scrollHeight;
      lastScrollTopRef.current = scrollEl.scrollTop;
    }
  }, []);

  // Reset scroll tracker on channel change
  useEffect(() => {
    initialScrollDone.current = false;
  }, [channelId]);

  // Scroll to bottom when active thread changes (entering/exiting thread view)
  useEffect(() => {
    if (highlightMessageId) return; // Prevent scroll to bottom when jumping to search result

    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeThreadId]);

  // IntersectionObserver for prepend scrolling history
  const loadMore = useCallback(async () => {
    if (isLoadingMoreRef.current || !hasMore || !notifications.length) return;
    isLoadingMoreRef.current = true;

    const scrollEl = scrollRef.current;
    if (scrollEl) {
      lastScrollHeightRef.current = scrollEl.scrollHeight;
      lastScrollTopRef.current = scrollEl.scrollTop;
      shouldAdjustScrollRef.current = true;
    }

    const firstSequence = notifications[0]?.sequence;
    if (firstSequence) {
      try {
        await loadMoreHistory({ userId, channelId, beforeSequence: firstSequence, query }).unwrap();
      } catch (err) {
        shouldAdjustScrollRef.current = false;
      }
    }
    
    isLoadingMoreRef.current = false;
  }, [hasMore, notifications, userId, channelId, loadMoreHistory, query]);

  useEffect(() => {
    const sentinel = topSentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { root: scrollRef.current, threshold: 0.1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-4 space-y-4">
      {/* Sentinel for infinite scroll loading at the top */}
      <div ref={topSentinelRef} className="h-px" />

      {/* Loading previous messages spinner */}
      {isLoadingMore && (
        <div className="flex justify-center py-2">
          <Loader size="sm" className="text-neutral-500" />
        </div>
      )}

      {/* Beginning of conversation indicator */}
      {!hasMore && !isHistoryLoading && notifications.length > 0 && (
        <div className="text-center text-[11px] text-neutral-600 py-2">
          Beginning of conversation
        </div>
      )}

      {isHistoryLoading && (
        <div className="flex justify-center py-6">
          <Loader size="md" />
        </div>
      )}

      {activeThreadId && activeParentNotification && (
        <div className="pb-4 border-b border-neutral-800/50 mb-4">
          <ReadStatusTracker
            id={activeParentNotification.id}
            userId={userId}
            status={activeParentNotification.status}
            isMe={activeParentNotification.senderId === userId}
            isChannelActive={isActive}
          >
            <NotificationBubble
              notification={activeParentNotification}
              isMe={activeParentNotification.senderId === userId}
              members={members}
            />
          </ReadStatusTracker>
          <div className="text-[11px] text-neutral-500 uppercase tracking-widest font-semibold mt-6 ml-2">
            Replies
          </div>
        </div>
      )}

      {displayedNotifications.map((msg) => {
        if (activeThreadId && msg.id === activeThreadId) return null;

        const replyCount = notifications.filter((n) => n.parentNotificationId === msg.id).length;

        return (
          <div key={msg.id} id={`msg-${msg.id}`} className="transition-all duration-300">
            <ReadStatusTracker
              id={msg.id}
              userId={userId}
              status={msg.status}
              isMe={msg.senderId === userId}
              isChannelActive={isActive}
            >
              <NotificationBubble
                notification={msg}
                isMe={msg.senderId === userId}
                members={members}
                replyCount={replyCount}
                onReply={!activeThreadId ? () => setActiveThreadId(msg.id) : undefined}
                isHighlighted={msg.id === highlightMessageId}
              />
            </ReadStatusTracker>
          </div>
        );
      })}
    </div>
  );
};
