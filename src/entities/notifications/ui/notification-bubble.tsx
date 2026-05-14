import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { type Notification } from '../model/types';
import { cn } from '../../../shared/lib/utils';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/app/providers/store';
import { MessageSquare, Trash2 } from 'lucide-react';
import { useSelector } from 'react-redux';
import { type RootState } from '@/app/providers/store';
import { useDeleteNotificationMutation } from '../api';
import { NotificationStatus } from './components/notification-status';
import { NotificationPriorityIcon } from './components/notification-priority-icon';
import { ImageModal, Avatar, Loader, Modal, Button } from '@/shared';
import { PageRoutes } from '@/shared/config';
import { notificationsApi } from '../api';

interface NotificationBubbleProps {
  notification: Notification;
  isMe: boolean;
  members?: any[];
  replyCount?: number;
  onReply?: () => void;
  isHighlighted?: boolean;
  isNew?: boolean;
}

export const NotificationBubble = ({
  notification,
  isMe,
  members = [],
  replyCount = 0,
  onReply,
  isHighlighted = false,
}: NotificationBubbleProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const currentUserId = useSelector((state: RootState) => state.user.currentUserId);
  const [deleteNotification, { isLoading: isDeleting }] = useDeleteNotificationMutation();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleProfileClick = () => {
    navigate(`${PageRoutes.profile}/${notification.senderId}`);
  };

  const handleRetry = () => {
    if (notification.status === 'FAILED_OFFLINE') {
      dispatch(
        notificationsApi.endpoints.sendNotification.initiate({
          senderId: notification.senderId,
          channelId: notification.channelId,
          notification: notification.text,
          clientNotificationId: notification.clientNotificationId,
          priority: notification.priority,
          parentNotificationId: notification.parentNotificationId,
        })
      );
    }
  };

  const handleDelete = async () => {
    try {
      await deleteNotification(notification.id).unwrap();
      setIsDeleteModalOpen(false);
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const formatMessageTime = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const compareDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (compareDate.getTime() === today.getTime()) {
      return timeString;
    }

    if (compareDate.getTime() === yesterday.getTime()) {
      return `Yesterday at ${timeString}`;
    }

    const dateString = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${dateString}, ${timeString}`;
  };

  const time = formatMessageTime(notification.createdAt);

  const sender = members?.find((m) => m.userId === notification.senderId);
  const currentUser = members?.find((m) => m.userId === currentUserId);
  const isAdmin = currentUser?.role === 'ADMIN';
  const senderName = sender ? (sender.fullName || sender.username) : null;
  const showSenderInfo = !isMe && (!!notification.parentNotificationId);

  return (
    <div
      className={cn(
        "flex items-end gap-2 group max-w-[90%]",
        isMe ? "ml-auto flex-row-reverse" : "mr-auto flex-row"
      )}
    >
      {showSenderInfo && (
        <Avatar
          name={senderName || notification.senderId}
          src={sender?.avatarUrl}
          size="sm"
          className="w-7 h-7 rounded-lg mb-4 shrink-0 shadow-sm cursor-pointer hover:opacity-80 transition-opacity"
          onClick={handleProfileClick}
        />
      )}

      {/* Bubble and metadata wrapper */}
      <div className={cn("flex flex-col max-w-[85%]", isMe ? "items-end" : "items-start")}>
        {showSenderInfo && senderName && (
          <div 
            className="text-[10px] text-violet-400 font-semibold mb-0.5 ml-1.5 drop-shadow-sm flex items-center gap-1 cursor-pointer hover:text-violet-300 transition-colors"
            onClick={handleProfileClick}
          >
            <span>{senderName}</span>
            {sender?.username && sender.fullName && (
              <span className="text-neutral-500 font-normal">@{sender.username}</span>
            )}
          </div>
        )}
        <div
          className={cn(
            "px-3 py-2 rounded-2xl text-sm relative transition-all duration-300 flex flex-col",
            isMe
              ? "bg-blue-600/15 text-blue-50 border border-blue-500/20 rounded-tr-none backdrop-blur-md"
              : "bg-neutral-800 text-neutral-100 rounded-tl-none border border-neutral-700/30",
            notification.isSending && "opacity-60",
            notification.status === "FAILED_OFFLINE" &&
            "border-red-500/30 bg-red-950/10 shadow-[0_0_15px_rgba(239,68,68,0.02)]",
            notification.priority === "HIGH" &&
            "border-l-4 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.05)]",
            isHighlighted && "ring-2 ring-violet-500 bg-violet-600/20 shadow-[0_0_25px_rgba(139,92,246,0.3)] scale-[1.02] border-violet-500/50"
          )}
        >
          {/* Message Text */}
          <span className="leading-relaxed break-words whitespace-pre-wrap">{notification.text}</span>

          {/* Attachments */}
          {notification.attachments && notification.attachments.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              {notification.attachments.map((url, i) => (
                <div key={i} className="relative group/img cursor-zoom-in" onClick={() => setPreviewImage(url)}>
                  <img src={url} alt="Attachment" className="max-w-[200px] max-h-[200px] object-cover rounded-xl border border-white/10 shadow-lg hover:border-violet-500/50 transition-all duration-300" />
                  <div className="absolute inset-0 bg-black/20 group-hover/img:bg-black/0 transition-colors rounded-xl" />
                </div>
              ))}
            </div>
          )}

          <ImageModal
            isOpen={!!previewImage}
            onClose={() => setPreviewImage(null)}
            src={previewImage || ''}
          />

          {/* Time & Read Status & Priority Icon */}
          <div className="flex items-center gap-1 justify-end text-[9px] text-neutral-400/60 select-none mt-1 shrink-0 self-end">
            <NotificationPriorityIcon priority={notification.priority} />
            <span>{time}</span>
            {isMe && (
              <NotificationStatus
                isSending={!!notification.isSending}
                status={notification.status as 'PENDING' | 'DELIVERED' | 'READ'}
                sequence={notification.sequence}
                senderId={notification.senderId}
                members={members}
                onRetry={handleRetry}
              />
            )}
          </div>
        </div>

        {/* Thread replies button below bubble */}
        {replyCount > 0 && onReply && (
          <button
            onClick={onReply}
            className={cn(
              "flex items-center gap-1 text-[9px] text-blue-400 hover:text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20 font-bold mt-1 transition-colors"
            )}
          >
            <MessageSquare size={10} />
            {replyCount} {replyCount === 1 ? "reply" : "replies"}
          </button>
        )}
      </div>

      {/* Hover Actions Area */}
      <div className={cn("flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity", isMe ? "flex-row-reverse" : "flex-row")}>
        {onReply && (
          <button
            onClick={onReply}
            className="p-1.5 rounded-full bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 cursor-pointer shadow-md shrink-0 flex items-center justify-center h-7 w-7"
            title="Reply in thread"
          >
            <MessageSquare size={12} />
          </button>
        )}
        
        {isAdmin && (
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            disabled={isDeleting}
            className="p-1.5 rounded-full bg-neutral-900 hover:bg-rose-950/30 text-neutral-400 hover:text-rose-500 border border-neutral-800 hover:border-rose-500/30 cursor-pointer shadow-md shrink-0 flex items-center justify-center h-7 w-7 transition-all"
            title="Delete message"
          >
            {isDeleting ? <Loader size="sm" /> : <Trash2 size={12} />}
          </button>
        )}
      </div>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Message"
      >
        <div className="space-y-4">
          <p className="text-sm text-neutral-400">
            Are you sure you want to delete this message? This action cannot be undone.
          </p>
          <div className="flex items-center gap-2 justify-end">
            <Button
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isDeleting}
              className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-3 py-1.5 h-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-rose-600 hover:bg-rose-500 text-white px-3 py-1.5 h-auto"
            >
              {isDeleting ? <Loader size="sm" className="mr-2" /> : null}
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
