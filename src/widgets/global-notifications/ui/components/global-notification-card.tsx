import { ArrowRight } from 'lucide-react';
import { NotificationPriorityIcon } from '@/entities/notifications';

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

interface GlobalNotificationCardProps {
  notification: NotificationItem;
  isUnread: boolean;
  onNavigateToChannel: (channelId: string) => void;
}

export const GlobalNotificationCard = ({
  notification,
  isUnread,
  onNavigateToChannel,
}: GlobalNotificationCardProps) => {
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isHigh = notification.priority === 'HIGH';

  return (
    <div
      className={`p-4 rounded-xl border transition-all duration-300 flex flex-col gap-3 relative overflow-hidden ${
        isUnread
          ? isHigh
            ? 'bg-red-500/[0.03] border-red-500/20 shadow-md shadow-red-500/[0.01]'
            : 'bg-neutral-900/40 border-neutral-900/30'
          : isHigh
          ? 'bg-red-500/[0.01] border-red-500/10'
          : 'bg-neutral-900/20 border-neutral-900/30'
      }`}
    >
      {/* Left glowing marker line */}
      {isUnread && (
        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-violet-500 to-indigo-500" />
      )}

      {/* Top Metainfo */}
      <div className="flex items-center justify-between gap-4 flex-wrap pl-1">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateToChannel(notification.channelId)}
            className={`text-xs font-bold px-2.5 py-0.5 rounded-lg transition-all duration-300 flex items-center gap-1 cursor-pointer border font-mono ${
              isUnread
                ? 'bg-violet-600/10 text-violet-400 hover:bg-violet-600 hover:text-white border-violet-500/10'
                : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-850 hover:text-white border-neutral-900'
            }`}
          >
            <span>#{notification.channelId}</span>
            <ArrowRight size={10} />
          </button>
          {isUnread && <span className="h-1.5 w-1.5 rounded-full bg-violet-500" title="Unread" />}
        </div>

        <div className="flex items-center gap-2 text-[11px] text-neutral-400">
          <NotificationPriorityIcon priority={notification.priority} />
          <span>{formatTime(notification.createdAt)}</span>
        </div>
      </div>

      {/* Body Text */}
      <div
        className={`text-[13px] leading-relaxed whitespace-pre-wrap break-words pl-1 ${
          isUnread ? 'text-white' : 'text-neutral-300'
        }`}
      >
        {notification.text}
      </div>
    </div>
  );
};
