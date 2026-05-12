import { useState, useRef, useLayoutEffect } from 'react';
import { Send } from 'lucide-react';
import { useSendNotificationMutation } from '@/entities/notifications/api';
import { Button } from '@/shared';
import { generateId } from '../../../shared/lib/utils';

interface NotificationFormProps {
  senderId: string;
  channelId?: string;
  replyingTo?: any | null;
  isThreadView?: boolean;
  onCancelReply?: () => void;
}

export const NotificationForm = ({
  senderId,
  channelId,
  replyingTo,
  isThreadView = false,
  onCancelReply,
}: NotificationFormProps) => {
  const [text, setText] = useState('');
  const [priority, setPriority] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('MEDIUM');
  const [sendNotification, { isLoading: isSending }] = useSendNotificationMutation();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!text.trim() || isSending) return;
    if (!channelId) return;

    const textToSend = text.trim();
    const clientNotificationId = generateId();

    setText('');
    setPriority('MEDIUM');
    if (onCancelReply) onCancelReply();

    try {
      await sendNotification({
        senderId,
        channelId,
        notification: textToSend,
        clientNotificationId,
        priority,
        parentNotificationId: replyingTo?.id,
      }).unwrap();
    } catch (err) {
      // If sending fails, restore text to the input so the user doesn't lose it
      setText(textToSend);
    }
  };

  // Auto-grow textarea height logic using useLayoutEffect to prevent layout thrashing and visual jumps
  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;

    const scrollTop = el.scrollTop;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
    el.scrollTop = scrollTop;
  }, [text]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col border-t border-neutral-800 bg-neutral-900">
      {replyingTo && !isThreadView && (
        <div className="px-4 py-2 bg-neutral-800/50 flex justify-between items-center text-sm">
          <div className="text-neutral-400 truncate">
            <span className="font-bold text-blue-400 mr-2">Replying to:</span>
            {replyingTo.text}
          </div>
          <button onClick={onCancelReply} className="text-neutral-500 hover:text-white">✕</button>
        </div>
      )}
      <form onSubmit={handleSend} className="p-4 flex gap-2 items-end">
        {!replyingTo && !isThreadView && (
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as any)}
            className="bg-neutral-800 text-xs text-white rounded p-2 outline-none h-9 mb-0.5"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        )}
        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={replyingTo ? "Type your reply..." : "Type a notification..."}
          className="bg-neutral-800 border-none text-white flex-1 resize-none py-2 px-3 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-neutral-700 min-h-[36px] max-h-[160px] overflow-y-auto leading-normal"
        />
        <Button type="submit" disabled={!text.trim() || !channelId || isSending} className="h-9 w-9 p-0 flex items-center justify-center shrink-0 mb-0.5 rounded-lg">
          <Send size={16} />
        </Button>
      </form>
    </div>
  );
};
