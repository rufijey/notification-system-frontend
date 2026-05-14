import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChannelList } from '@/widgets/channel-list';
import { ProfileHeader } from './components/profile-header';
import { MessageSquare, Plus, Bell, Shield } from 'lucide-react';
import { PageRoutes } from '@/shared/config';
import { useGetChannelsQuery } from '@/entities/notifications/api';
import { selectCurrentUser } from '@/entities/user/model/user.slice';
import { UserRole } from '@/entities/user/model/types';

interface SidebarProps {
  selectedChannelId: string | null;
  onSelectChannel: (channelId: string) => void;
  className?: string;
}

export const Sidebar = ({ selectedChannelId, onSelectChannel, className }: SidebarProps) => {
  const user = useSelector(selectCurrentUser);
  const currentUserId = user.username;
  const fullName = user.fullName;
  const avatarUrl = user.avatarUrl;
  const isAdmin = user.role === UserRole.GLOBAL_ADMIN;
  const location = useLocation();
  const navigate = useNavigate();

  // 1. Fetch channels to count total unread messages reactively
  const { data: channels = [] } = useGetChannelsQuery(currentUserId || '', {
    skip: !currentUserId,
  });

  if (!currentUserId) return null;

  const totalUnreadCount = channels.reduce((acc, channel) => acc + (channel.unreadCount || 0), 0);

  const isChannelsActive = location.pathname.startsWith(PageRoutes.channelBase);
  const isCreateActive = location.pathname.startsWith(PageRoutes.createChannel);
  const isNotificationsActive = location.pathname.startsWith(PageRoutes.globalNotifications);
  const isAdminActive = location.pathname.startsWith(PageRoutes.adminDashboard);

  return (
    <div className={`flex flex-col h-full border-r border-neutral-900/40 bg-neutral-900 w-full md:w-80 md:shrink-0 ${className || ''}`}>
      {/* 1. Profile block and logout header */}
      <ProfileHeader currentUserId={currentUserId} fullName={fullName} avatarUrl={avatarUrl || undefined} />

      {/* 2. Split view under user block */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Slim vertical sidebar with 3 small icons (very dark subtle border) */}
        <div className="w-14 bg-neutral-950 border-r border-neutral-900/30 flex flex-col items-center py-4 gap-3 shrink-0">
          <button
            onClick={() => navigate(PageRoutes.channelBase)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 cursor-pointer ${isChannelsActive
              ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/15'
              }`}
            title="Channels & messages"
          >
            <MessageSquare size={18} />
          </button>

          <button
            onClick={() => navigate(PageRoutes.createChannel)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 cursor-pointer ${isCreateActive
              ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/15'
              }`}
            title="Create channel"
          >
            <Plus size={18} />
          </button>

          <button
            onClick={() => navigate(PageRoutes.globalNotifications)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 cursor-pointer relative ${isNotificationsActive
              ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/15'
              }`}
            title="Global notifications feed"
          >
            <Bell size={18} />
            {totalUnreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-bold h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center border border-neutral-950 animate-pulse">
                {totalUnreadCount}
              </span>
            )}
          </button>

          {isAdmin && (
            <button
              onClick={() => navigate(PageRoutes.adminDashboard)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 cursor-pointer ${isAdminActive
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/15'
                }`}
              title="Admin Dashboard"
            >
              <Shield size={18} />
            </button>
          )}
        </div>

        <div className="flex-1 flex flex-col overflow-hidden bg-neutral-900">
          <ChannelList
            userId={currentUserId}
            selectedChannelId={selectedChannelId}
            onSelectChannel={onSelectChannel}
          />
        </div>
      </div>
    </div>
  );
};
