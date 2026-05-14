import { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { Send, Image as ImageIcon } from 'lucide-react';
import { useSendNotificationMutation } from '@/entities/notifications/api';
import { Button, ImageModal, Loader } from '@/shared';
import { generateId, cn } from '../../../shared/lib/utils';
import { uploadFileToS3 } from '@/shared/api/upload';
import { useSelector } from 'react-redux';
import type { RootState } from '@/app/providers/store';

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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [sendNotification, { isLoading: isSending }] = useSendNotificationMutation();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const token = useSelector((state: RootState) => state.user.accessToken);

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);

  useEffect(() => {
    // Generate previews for selected files
    const urls = selectedFiles.map(file => URL.createObjectURL(file));
    setFilePreviews(urls);

    return () => {
      // Clean up previews
      urls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [selectedFiles]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!text.trim() && selectedFiles.length === 0) || isSending || isUploading) return;
    if (!channelId) return;

    const textToSend = text.trim();
    const clientNotificationId = generateId();
    const filesToUpload = [...selectedFiles];

    setText('');
    setPriority('MEDIUM');
    setSelectedFiles([]);
    if (onCancelReply) onCancelReply();

    try {
      setIsUploading(true);
      const attachments: string[] = [];
      for (const file of filesToUpload) {
        if (token) {
          const url = await uploadFileToS3(file, token);
          attachments.push(url);
        }
      }
      setIsUploading(false);
      await sendNotification({
        senderId,
        channelId,
        notification: textToSend || ' ',
        clientNotificationId,
        priority,
        parentNotificationId: replyingTo?.id,
        attachments,
      }).unwrap();
    } catch (err) {
      // If sending fails, restore text to the input so the user doesn't lose it
      setText(textToSend);
      setSelectedFiles(filesToUpload);
      setIsUploading(false);
    }
  };

  // Auto-grow textarea height logic using useLayoutEffect to prevent layout thrashing and visual jumps
  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;

    el.style.height = 'auto';
    const newHeight = Math.min(el.scrollHeight, 160);
    el.style.height = `${newHeight}px`;

    // Hide scrollbar if content fits within max-height
    if (el.scrollHeight <= 160) {
      el.style.overflowY = 'hidden';
    } else {
      el.style.overflowY = 'auto';
    }
  }, [text]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col border-t border-neutral-800 bg-neutral-900 shadow-[0_-4px_20px_rgba(0,0,0,0.2)]">
      {replyingTo && !isThreadView && (
        <div className="px-4 py-2 bg-neutral-800/50 flex justify-between items-center text-xs border-b border-neutral-800/30">
          <div className="text-neutral-400 truncate flex items-center gap-2">
            <span className="font-bold text-blue-400">Replying to:</span>
            <span className="truncate">{replyingTo?.text || 'message'}</span>
          </div>
          <button onClick={onCancelReply} className="text-neutral-500 hover:text-white transition-colors cursor-pointer">✕</button>
        </div>
      )}
      <form onSubmit={handleSend} className="p-4 flex gap-3 items-end max-w-5xl mx-auto w-full">
        {!replyingTo && !isThreadView && (
          <div className="flex bg-neutral-800 p-1 rounded-xl border border-neutral-700/50 mb-0.5 shrink-0 h-10 items-center gap-1 shadow-inner">
            {[
              { id: 'LOW', label: 'Low', color: 'text-blue-400', activeBg: 'bg-blue-500/20 border-blue-500/30 shadow-blue-500/10' },
              { id: 'MEDIUM', label: 'Med', color: 'text-amber-400', activeBg: 'bg-amber-500/20 border-amber-500/30 shadow-amber-500/10' },
              { id: 'HIGH', label: 'High', color: 'text-red-400', activeBg: 'bg-red-500/20 border-red-500/30 shadow-red-500/10' }
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPriority(p.id as any)}
                className={cn(
                  "px-2.5 h-7 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-300 border border-transparent cursor-pointer",
                  priority === p.id
                    ? `${p.color} ${p.activeBg} shadow-lg scale-105 z-10`
                    : "text-neutral-500 hover:text-neutral-300 hover:bg-neutral-700/50"
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        )}
        <input
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={(e) => {
            if (e.target.files) {
              setSelectedFiles(prev => [...prev, ...Array.from(e.target.files!)]);
            }
          }}
        />
        <div className="flex flex-col flex-1 gap-3">
          {selectedFiles.length > 0 && (
            <div className="flex gap-2 px-1 flex-wrap animate-in slide-in-from-bottom-2 duration-300">
              {filePreviews.map((url, i) => (
                <div key={i} className="relative group/thumb">
                  <div
                    className="w-16 h-16 rounded-xl overflow-hidden border border-neutral-700 bg-neutral-800 cursor-zoom-in"
                    onClick={() => setPreviewImage(url)}
                  >
                    <img src={url} alt="Preview" className="w-full h-full object-cover transition-transform group-hover/thumb:scale-110" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedFiles(prev => prev.filter((_, idx) => idx !== i))}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-neutral-900 text-white rounded-full flex items-center justify-center text-[10px] border border-neutral-700 hover:bg-red-500 hover:border-red-500 transition-all shadow-lg z-10 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2 relative">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="h-10 w-10 p-0 flex items-center justify-center shrink-0 mb-0.5 rounded-xl text-neutral-400 hover:text-white bg-neutral-800 border border-neutral-700/50 hover:bg-neutral-700/50 transition-all cursor-pointer active:scale-95"
              title="Add images"
            >
              <ImageIcon size={18} />
            </button>
            <textarea
              ref={textareaRef}
              rows={1}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={replyingTo ? "Type your reply..." : "Type a notification..."}
              className="bg-neutral-800 border border-neutral-700/50 text-white flex-1 resize-none py-2.5 px-4 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-violet-500/50 min-h-[40px] max-h-[160px] leading-relaxed placeholder:text-neutral-500 transition-all shadow-inner"
            />
          </div>
        </div>
        <Button
          type="submit"
          disabled={(!text.trim() && selectedFiles.length === 0) || !channelId || isSending || isUploading}
          className="h-10 w-10 p-0 flex items-center justify-center shrink-0 mb-0.5 rounded-xl bg-violet-600 hover:bg-violet-500 shadow-lg shadow-violet-600/20 active:scale-95 transition-all"
        >
          {isUploading ? <Loader size="sm" /> : <Send size={18} />}
        </Button>
      </form>

      <ImageModal
        isOpen={!!previewImage}
        onClose={() => setPreviewImage(null)}
        src={previewImage || ''}
      />
    </div>
  );
};
