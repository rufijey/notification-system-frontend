import { useEffect, useState, useRef } from 'react';
import {
  useGetHistoryQuery,
  useGetChannelsQuery,
  useMarkAllAsReadMutation,
  useUpdateMemberRoleMutation,
  useLoadMoreHistoryMutation,
  useJoinChannelMutation,
  useGetChannelDetailsQuery,
  useInviteUserMutation,
  useLeaveChannelMutation,
  useGetChannelMembersQuery,
  useRenameChannelMutation,
} from '@/entities/notifications/api';
import { NotificationForm } from '@/features/send-notification';
import { Bell, BellOff, ShieldAlert, Info } from 'lucide-react';
import { Loader, Button } from '@/shared';
import { useNavigate } from 'react-router-dom';
import { PageRoutes } from '@/shared/config';

import { ChannelHeader } from './components/channel-header';
import { MembersList } from './components/members-list';
import { InviteModal } from './components/invite-modal';
import { LeaveModal } from './components/leave-modal';
import { RenameModal } from './components/rename-modal';
import { ReportModal } from './components/report-modal';
import { ThreadBar } from './components/thread-bar';
import { MessageFeed } from './components/message-feed';
import { BanModal } from './components/ban-modal';
import { useBanChannelMutation, useReportChannelMutation } from '@/entities/admin/api/admin.api';

interface NotificationWindowProps {
  userId: string;
  channelId: string;
  isActive?: boolean;
}

export const NotificationWindow = ({ userId, channelId, isActive = false }: NotificationWindowProps) => {
  const navigate = useNavigate();
  const { data: channels = [], isLoading: isChannelsLoading } = useGetChannelsQuery(userId);
  const [markAllAsRead] = useMarkAllAsReadMutation();
  const [inviteUser] = useInviteUserMutation();
  const [leaveChannel] = useLeaveChannelMutation();
  const [updateRole] = useUpdateMemberRoleMutation();
  const [renameChannel] = useRenameChannelMutation();
  const [reportChannelMutation] = useReportChannelMutation();

  const [loadMoreHistory] = useLoadMoreHistoryMutation();
  const [joinChannel, { isLoading: isJoining }] = useJoinChannelMutation();

  const [showMembers, setShowMembers] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [banModalOpen, setBanModalOpen] = useState(false);
  const [banChannel] = useBanChannelMutation();

  const [searchVal, setSearchVal] = useState('');
  const [debouncedSearchVal, setDebouncedSearchVal] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const [historyLimit, setHistoryLimit] = useState(30);
  const [highlightMessageId, setHighlightMessageId] = useState<string | null>(null);

  const [searchLimit, setSearchLimit] = useState(30);
  const searchResultsRef = useRef<HTMLDivElement>(null);
  const shouldScrollSearchToBottomRef = useRef(true);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchVal(searchVal);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchVal]);

  // Reset search limits and scroll state on value or channel change
  useEffect(() => {
    setSearchLimit(30);
    shouldScrollSearchToBottomRef.current = true;
  }, [debouncedSearchVal, channelId]);

  // Clear highlight message id after 3 seconds
  useEffect(() => {
    if (highlightMessageId) {
      const timer = setTimeout(() => {
        setHighlightMessageId(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [highlightMessageId]);

  // We use this to track if we are in thread view.
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);

  const { data: channelDetails } = useGetChannelDetailsQuery(channelId!, { skip: !channelId });

  const currentChannel = channels.find((c) => c.channelId === channelId);
  const showStatus = !isChannelsLoading && !!(currentChannel || channelDetails);
  const title = currentChannel?.title || channelDetails?.title || `Channel ${channelId?.slice(0, 8)}`;
  const photoUrl = currentChannel?.photoUrl || channelDetails?.photoUrl;
  const role = currentChannel?.role;
  const memberCount = currentChannel?.memberIds?.length || channelDetails?.memberCount || 0;

  // Main chat history query (no query filter, but with dynamic limit)
  const { data: historyData, isLoading: isHistoryLoading, error: historyError } = useGetHistoryQuery(
    { userId, channelId: channelId!, limit: historyLimit },
    { skip: !channelId }
  );
  
  const isBanned = (historyError as any)?.status === 403 || channelDetails?.isBanned;
  const banMessage = (historyError as any)?.data?.message || 'This channel has been restricted by an administrator.';

  const notifications = historyData?.items ?? [];
  const hasMore = historyData?.hasMore ?? false;

  // Secondary search query (used to populate the overlay list of matching results)
  const { data: searchResultsData, isFetching: isSearching } = useGetHistoryQuery(
    { userId, channelId: channelId!, query: debouncedSearchVal, limit: searchLimit },
    { skip: !channelId || !showSearch || !debouncedSearchVal }
  );
  const searchResults = searchResultsData?.items ?? [];
  const searchHasMore = searchResultsData?.hasMore ?? false;

  // Scroll to bottom on initial search load
  useEffect(() => {
    if (showSearch && searchResultsRef.current && searchResults.length > 0) {
      if (shouldScrollSearchToBottomRef.current) {
        searchResultsRef.current.scrollTop = searchResultsRef.current.scrollHeight;
        shouldScrollSearchToBottomRef.current = false;
      }
    }
  }, [searchResults, showSearch]);

  const handleSearchScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (target.scrollTop === 0 && searchHasMore && !isSearching) {
      const prevScrollHeight = target.scrollHeight;
      setSearchLimit((prev) => prev + 30);

      // Adjust scroll position after render paint to keep scroll position intact
      setTimeout(() => {
        if (target) {
          target.scrollTop = target.scrollHeight - prevScrollHeight;
        }
      }, 200);
    }
  };

  const { data: members = [] } = useGetChannelMembersQuery(channelId!, { skip: !channelId });

  useEffect(() => {
    const handleRead = () => {
      if (
        document.visibilityState === 'visible' &&
        document.hasFocus() &&
        channelId &&
        userId &&
        !isHistoryLoading &&
        notifications.length > 0
      ) {
        markAllAsRead({ userId, channelId });
      }
    };

    handleRead();

    window.addEventListener('visibilitychange', handleRead);
    window.addEventListener('focus', handleRead);

    return () => {
      window.removeEventListener('visibilitychange', handleRead);
      window.removeEventListener('focus', handleRead);
    };
  }, [channelId, userId, isHistoryLoading, notifications.length, markAllAsRead]);

  // Reset thread view, search, and history limits when channel changes
  useEffect(() => {
    setActiveThreadId(null);
    setSearchVal('');
    setDebouncedSearchVal('');
    setShowSearch(false);
    setHistoryLimit(30);
    setHighlightMessageId(null);
  }, [channelId]);

  const handleSearchResultClick = (sequence: number, id: string) => {
    const latestSequence = currentChannel?.lastNotificationSequence || (notifications.length > 0 ? notifications[notifications.length - 1].sequence : 0);
    const neededLimit = Math.max(30, latestSequence - sequence + 15);
    setHistoryLimit(neededLimit);
    setHighlightMessageId(id);
    setShowSearch(false);
    setSearchVal('');
    setDebouncedSearchVal('');
  };

  // Derived state for notifications
  const displayedNotifications = activeThreadId
    ? notifications.filter((n) => n.id === activeThreadId || n.parentNotificationId === activeThreadId)
    : notifications.filter((n) => !n.parentNotificationId);

  const activeParentNotification = activeThreadId ? (notifications.find((n) => n.id === activeThreadId) ?? null) : null;

  const handleReport = async (reason: string) => {
    try {
      await reportChannelMutation({ channelId, reason }).unwrap();
    } catch (err) {
      console.error('Failed to report channel:', err);
      throw err;
    }
  };

  const handleBan = async (reason: string, durationDays?: number) => {
    try {
      await banChannel({ channelId, reason, durationDays }).unwrap();
      navigate(PageRoutes.channelBase);
    } catch (err) {
      console.error('Failed to ban channel:', err);
      throw err;
    }
  };

  return (
    <div className="flex flex-col h-full bg-neutral-950 flex-1 relative">
      <ChannelHeader
        title={title}
        channelId={channelId!}
        photoUrl={photoUrl}
        showStatus={showStatus}
        memberCount={memberCount}
        role={role}
        showMembers={showMembers}
        setShowMembers={setShowMembers}
        onInviteClick={() => setInviteModalOpen(true)}
        onLeaveClick={() => setLeaveModalOpen(true)}
        onRenameClick={() => setRenameModalOpen(true)}
        onReportClick={() => setReportModalOpen(true)}
        searchVal={searchVal}
        setSearchVal={setSearchVal}
        showSearch={showSearch}
        setShowSearch={setShowSearch}
        onBackClick={() => navigate(PageRoutes.channelBase)}
        onBanClick={() => setBanModalOpen(true)}
      />

      {isBanned ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-neutral-950">
          <div className="w-24 h-24 bg-rose-500/10 rounded-[32px] flex items-center justify-center text-rose-500 mb-6 animate-pulse">
            <ShieldAlert size={48} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Channel Restricted</h2>
          <div className="max-w-md bg-neutral-900/50 border border-neutral-800 p-6 rounded-3xl backdrop-blur-sm">
            <p className="text-neutral-400 text-sm leading-relaxed">
              {banMessage}
            </p>
          </div>
          <p className="mt-8 text-xs text-neutral-600 flex items-center gap-2">
            <Info size={12} />
            If you believe this is a mistake, please contact support.
          </p>
        </div>
      ) : (
        <>
          {showMembers && (
            <MembersList
              members={members}
              userId={userId}
              channelId={channelId!}
              role={role}
              updateRole={updateRole}
            />
          )}

          {activeThreadId && <ThreadBar onBack={() => setActiveThreadId(null)} />}

          <MessageFeed
            userId={userId}
            channelId={channelId!}
            isActive={isActive}
            notifications={notifications}
            displayedNotifications={displayedNotifications}
            hasMore={hasMore}
            isHistoryLoading={isHistoryLoading}
            loadMoreHistory={loadMoreHistory}
            activeThreadId={activeThreadId}
            setActiveThreadId={setActiveThreadId}
            activeParentNotification={activeParentNotification}
            members={members}
            query={debouncedSearchVal}
            highlightMessageId={highlightMessageId}
            isMember={!!role}
          />
        </>
      )}

      {/* Telegram-style Search Results Overlay */}
      {showSearch && searchVal.trim() !== '' && (
        <div
          ref={searchResultsRef}
          onScroll={handleSearchScroll}
          className="absolute inset-x-0 top-[72px] bottom-0 bg-neutral-950/95 backdrop-blur-sm z-20 flex flex-col p-4 overflow-y-auto space-y-3"
        >
          <div className="text-xs text-neutral-400 font-semibold mb-1 flex justify-between items-center shrink-0">
            <span>{isSearching && searchLimit === 30 ? 'Searching messages...' : `Search Results (${searchResults.length} matches)`}</span>
            {searchHasMore && <span className="text-[10px] text-neutral-500 font-normal">Scroll up to load older</span>}
          </div>

          {isSearching && searchLimit > 30 && (
            <div className="flex justify-center py-2 shrink-0">
              <Loader size="sm" />
            </div>
          )}

          {isSearching && searchResults.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader size="md" />
            </div>
          ) : searchResults.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-neutral-500 gap-2">
              <span className="text-sm">No messages found</span>
              <span className="text-xs text-neutral-600">Try searching for different keywords</span>
            </div>
          ) : (
            searchResults.map((msg) => {
              const sender = members?.find((m) => m.userId === msg.senderId);
              const senderName = sender ? (sender.fullName || sender.username) : 'System';
              const date = new Date(msg.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={msg.id}
                  onClick={() => handleSearchResultClick(msg.sequence, msg.id)}
                  className="p-3 bg-neutral-900 border border-neutral-800/60 rounded-xl hover:bg-neutral-850 hover:border-neutral-700 transition-all duration-200 cursor-pointer flex flex-col gap-1 active:scale-[0.99]"
                >
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-bold text-violet-400">{senderName}</span>
                    <span className="text-neutral-500">{date}</span>
                  </div>
                  <div className="text-sm text-neutral-200 line-clamp-2 break-words">
                    {msg.text}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {!isBanned && (
        !role ? (
          <div className="h-[72px] px-4 border-t border-neutral-800 bg-neutral-900 flex items-center justify-center shrink-0">
            <Button
              onClick={() => joinChannel({ userId, channelId })}
              disabled={isJoining}
              className="w-full max-w-xs bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold h-11 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 active:scale-[0.98]"
            >
              {isJoining ? (
                <Loader size="sm" className="text-white" />
              ) : (
                <Bell className="h-4 w-4 text-violet-200" />
              )}
              Subscribe to Channel
            </Button>
          </div>
        ) : role === 'SUBSCRIBER' && !activeThreadId ? (
          <div className="h-[72px] px-4 border-t border-neutral-800 bg-neutral-900 flex items-center justify-center shrink-0">
            <Button
              onClick={() => setLeaveModalOpen(true)}
              className="w-full max-w-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/15 hover:border-red-500/30 font-bold h-11 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <BellOff className="h-4 w-4" />
              Unsubscribe
            </Button>
          </div>
        ) : (
          <NotificationForm
            senderId={userId}
            channelId={channelId}
            replyingTo={activeThreadId ? activeParentNotification : null}
            isThreadView={!!activeThreadId}
          />
        )
      )}

      <InviteModal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        onInvite={(memberId) => inviteUser({ channelId: channelId!, memberId })}
      />

      <LeaveModal
        isOpen={leaveModalOpen}
        onClose={() => setLeaveModalOpen(false)}
        onLeave={() => leaveChannel({ channelId: channelId! })}
      />

      <RenameModal
        isOpen={renameModalOpen}
        onClose={() => setRenameModalOpen(false)}
        onRename={(newTitle, newPhotoUrl) => renameChannel({ channelId: channelId!, title: newTitle, photoUrl: newPhotoUrl })}
        currentTitle={title}
        currentPhotoUrl={photoUrl}
      />

      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        onReport={handleReport}
      />

      <BanModal
        isOpen={banModalOpen}
        onClose={() => setBanModalOpen(false)}
        onBan={handleBan}
        channelTitle={title}
      />

    </div>
  );
};
