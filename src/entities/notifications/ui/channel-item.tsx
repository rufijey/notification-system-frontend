import { cn } from '../../../shared/lib/utils';
import { Avatar } from '@/shared';
import { type Channel } from '../../notifications/model/types';

interface ChannelItemProps {
  channel: Channel;
  isSelected: boolean;
  onClick: () => void;
}

export const ChannelItem = ({ channel, isSelected, onClick }: ChannelItemProps) => {
  const displayName = channel.title || `Channel ${channel.channelId.slice(0, 8)}`;

  const formatTime = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const compareDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if (compareDate.getTime() === today.getTime()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    if (compareDate.getTime() === yesterday.getTime()) {
      return 'Yesterday';
    }

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 p-4 hover:bg-neutral-800 transition-colors border-b border-neutral-800/50',
        isSelected && 'bg-neutral-800'
      )}
    >
      <Avatar name={displayName} src={channel.photoUrl} />
      <div className="flex-1 text-left min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="font-medium text-white truncate">{displayName}</div>
          </div>
          {channel.lastNotification && (
            <div className="text-[10px] text-neutral-500 shrink-0">
              {formatTime(channel.lastActivity)}
            </div>
          )}
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="text-xs text-neutral-500 truncate flex-1">
            {channel.lastNotification || 'No notifications yet'}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {channel.unreadCount > 0 && (
              <div className="bg-sky-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] h-4 flex items-center justify-center shadow-sm">
                {channel.unreadCount > 99 ? '99+' : channel.unreadCount}
              </div>
            )}
          </div>
        </div>
      </div>
    </button>
  );
};
