import { useEffect, useRef, useCallback, useLayoutEffect, useState } from 'react';
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
  loadMoreHistory: (arg: { userId: string; channelId: string; beforeSequence: number; query?: string }) => any;
  activeThreadId: string | null;
  setActiveThreadId: (id: string | null) => void;
  activeParentNotification: Notification | null;
  members: ChannelMember[];
  query?: string;
  highlightMessageId?: string | null;
  isMember?: boolean;
}

export const MessageFeed = ({
  userId,
  channelId,
  isActive,
  notifications,
  displayedNotifications,
  hasMore,
  isHistoryLoading,
  loadMoreHistory,
  activeThreadId,
  setActiveThreadId,
  activeParentNotification,
  members,
  query,
  highlightMessageId,
  isMember = false,
}: MessageFeedProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const topSentinelRef = useRef<HTMLDivElement>(null);
  const isLoadingMoreRef = useRef(false);
  const initialScrollDone = useRef(false);
  const isAtBottomRef = useRef(true);

  // State to capture the first unread message when opening the chat
  const [firstUnreadId, setFirstUnreadId] = useState<string | null>(null);
  const prevChannelIdRef = useRef<string | null>(null);
  const hasCapturedInitialUnreadRef = useRef(false);

  // Refs for tracking scroll size and positions for perfect infinite scroll restoration
  const lastScrollHeightRef = useRef<number>(0);
  const lastScrollTopRef = useRef<number>(0);
  const shouldAdjustScrollRef = useRef<boolean>(false);
  const prevLastNotificationIdRef = useRef<string | null>(null);

  // Scroll to bottom on initial load, thread switch, and subsequent new messages
  const lastNotificationId = displayedNotifications[displayedNotifications.length - 1]?.id;

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

  // Reset unread message tracker on channel change
  useEffect(() => {
    if (prevChannelIdRef.current !== channelId) {
      setFirstUnreadId(null);
      hasCapturedInitialUnreadRef.current = false;
      prevChannelIdRef.current = channelId;
    }
  }, [channelId]);

  // Capture the first unread message when history is loaded
  useEffect(() => {
    if (!isMember) return;

    if (!isHistoryLoading && displayedNotifications.length > 0 && !hasCapturedInitialUnreadRef.current) {
      const firstUnread = displayedNotifications.find(
        (msg) => msg.senderId !== userId && msg.status !== 'READ'
      );
      if (firstUnread) {
        setFirstUnreadId(firstUnread.id);
      }
      hasCapturedInitialUnreadRef.current = true;
    }
  }, [isHistoryLoading, displayedNotifications, userId, isMember]);

  // Unified Scroll Handling (Initial load, Sender, and Recipient updates)
  useLayoutEffect(() => {
    if (isHistoryLoading || !lastNotificationId || !scrollRef.current) return;

    const scrollEl = scrollRef.current;

    // Handle initial load scroll
    if (!initialScrollDone.current) {
      const firstUnread = displayedNotifications.find(
        (msg) => msg.senderId !== userId && msg.status !== 'READ'
      );

      if (firstUnread) {
        const el = document.getElementById(`msg-${firstUnread.id}`);
        if (el) {
          scrollEl.scrollTop = el.offsetTop - 20;
          initialScrollDone.current = true;
          isAtBottomRef.current = false;
          prevLastNotificationIdRef.current = lastNotificationId;
          return;
        }
      }

      // Default: scroll to bottom
      scrollEl.scrollTop = scrollEl.scrollHeight;
      initialScrollDone.current = true;
      isAtBottomRef.current = true;
      prevLastNotificationIdRef.current = lastNotificationId;
      return;
    }

    const isNewMessage = prevLastNotificationIdRef.current !== lastNotificationId;
    if (isNewMessage && !highlightMessageId) {
      const lastMsg = displayedNotifications[displayedNotifications.length - 1];
      const isLastMessageMe = lastMsg?.senderId === userId;

      // If a new message arrives and the tab is hidden (user is not looking at it),
      // mark it as the start of new notifications.
      if (!isLastMessageMe && document.visibilityState !== 'visible') {
        if (!firstUnreadId) {
          setFirstUnreadId(lastMsg.id);
        }
      }

      if (isLastMessageMe || isAtBottomRef.current) {
        requestAnimationFrame(() => {
          if (scrollRef.current) {
            scrollRef.current.scrollTo({
              top: scrollRef.current.scrollHeight,
              behavior: 'smooth',
            });
          }
        });
        isAtBottomRef.current = true;
      }
    }

    prevLastNotificationIdRef.current = lastNotificationId;
  }, [isHistoryLoading, lastNotificationId, highlightMessageId, userId, displayedNotifications, firstUnreadId]);

  // Keep scroll anchored to bottom when content height changes (e.g. images loading)
  useEffect(() => {
    const scrollEl = scrollRef.current;
    const contentEl = contentRef.current;
    if (!scrollEl || !contentEl) return;

    const resizeObserver = new ResizeObserver(() => {
      if (isAtBottomRef.current && !isLoadingMoreRef.current) {
        requestAnimationFrame(() => {
          scrollEl.scrollTop = scrollEl.scrollHeight;
        });
      }
    });

    resizeObserver.observe(contentEl);
    return () => resizeObserver.disconnect();
  }, []);

  // Keep scroll anchored to bottom on scroll container resize (e.g. window resize, keyboard)
  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;

    let lastHeight = scrollEl.clientHeight;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const newHeight = entry.target.clientHeight;
        if (lastHeight !== newHeight && isAtBottomRef.current) {
          scrollEl.scrollTop = scrollEl.scrollHeight;
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

    // Check if the user is scrolled to the bottom (within 100px threshold)
    const isAtBottom = scrollEl.scrollHeight - scrollEl.scrollTop - scrollEl.clientHeight < 100;
    isAtBottomRef.current = isAtBottom;
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
      isAtBottomRef.current = true;
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

      <div ref={contentRef} className="flex flex-col space-y-4">
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
          const isFirstUnread = msg.id === firstUnreadId;
          const isNew = msg.senderId !== userId && msg.status !== 'READ';

          return (
            <div key={msg.id} id={`msg-${msg.id}`} className="transition-all duration-300">
              {isFirstUnread && (
                <div className="flex items-center gap-4 my-6">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />
                  <span className="text-[10px] font-bold text-violet-400 tracking-wider uppercase bg-violet-950/20 px-3 py-1 rounded-full border border-violet-500/15 shadow-[0_0_15px_rgba(139,92,246,0.1)] select-none">
                    New Notifications
                  </span>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />
                </div>
              )}
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
                  isNew={isNew}
                />
              </ReadStatusTracker>
            </div>
          );
        })}
      </div>

      {/* Bottom spacer to prevent browser padding-bottom scroll bug */}
      <div className="h-1 shrink-0" />
    </div>
  );
};
