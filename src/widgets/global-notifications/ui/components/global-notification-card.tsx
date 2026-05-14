import { ArrowRight, MessageSquare } from 'lucide-react';
import { NotificationPriorityIcon } from '@/entities/notifications';
import { Avatar } from '@/shared';

interface NotificationItem {
  id: string;
  channelId: string;
  senderId: string;
  text: string;
  sequence: number;
  createdAt: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
  attachments?: { url: string }[];
  channel?: {
    title?: string;
    photoUrl?: string;
    members?: { lastReadSequence: number }[];
  };
}

import { useState } from 'react';
import { ImageModal } from '@/shared';

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
  const [previewImage, setPreviewImage] = useState<string | null>(null);
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
  const channelTitle = notification.channel?.title || 'Channel';

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
        <div className="flex items-center gap-3">
          <Avatar 
            name={channelTitle} 
            src={notification.channel?.photoUrl} 
            size="sm" 
            className="w-8 h-8 rounded-lg border border-white/20 shadow-sm" 
          />
          <div className="flex flex-col">
            <button
              onClick={() => onNavigateToChannel(notification.channelId)}
              className={`text-xs font-bold transition-all duration-300 flex items-center gap-1 cursor-pointer hover:text-violet-400 text-left ${
                isUnread ? 'text-white' : 'text-neutral-300'
              }`}
            >
              <span className="truncate max-w-[150px]">{channelTitle}</span>
              <ArrowRight size={12} className="text-neutral-500" />
            </button>
            <span className="text-[10px] text-neutral-500 font-mono">#{notification.channelId}</span>
          </div>
          {isUnread && <span className="h-1.5 w-1.5 rounded-full bg-violet-500 ml-1" title="Unread" />}
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

      {/* Attachments */}
      {notification.attachments && notification.attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 pl-1 mt-1">
          {notification.attachments.map((att, i) => (
            <div 
              key={i} 
              className="relative group/img cursor-zoom-in shrink-0" 
              onClick={(e) => {
                e.stopPropagation();
                setPreviewImage(att.url);
              }}
            >
              <img 
                src={att.url} 
                alt="Attachment" 
                className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border border-white/15 shadow-md hover:border-violet-500/50 transition-all duration-300" 
              />
              <div className="absolute inset-0 bg-black/10 group-hover/img:bg-black/0 transition-colors rounded-lg" />
            </div>
          ))}
        </div>
      )}

      <ImageModal 
        isOpen={!!previewImage} 
        onClose={() => setPreviewImage(null)} 
        src={previewImage || ''} 
      />
    </div>
  );
};
