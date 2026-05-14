import { useState, useEffect, useRef } from 'react';
import { Edit2, Users, Check, X, Camera } from 'lucide-react';
import { Avatar, Loader } from '@/shared';
import { uploadFileToS3 } from '@/shared/api/upload';
import { useSelector } from 'react-redux';
import { type RootState } from '@/app/providers/store';
import { cn } from '@/shared/lib/utils';

interface ChannelShowcaseProps {
  channelTitle: string;
  channelId: string;
  photoUrl?: string;
  memberCount: number;
  isAdmin: boolean;
  onUpdateDetails: (newTitle?: string, newPhotoUrl?: string) => void;
}

export const ChannelShowcase = ({
  channelTitle,
  channelId,
  photoUrl,
  memberCount,
  isAdmin,
  onUpdateDetails,
}: ChannelShowcaseProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(channelTitle);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const token = useSelector((state: RootState) => state.user.accessToken);

  useEffect(() => {
    setEditTitle(channelTitle);
  }, [channelTitle]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    const trimmed = editTitle.trim();
    if (trimmed && trimmed !== channelTitle) {
      onUpdateDetails(trimmed, photoUrl);
    }
    setIsEditing(false);
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    try {
      setIsUploading(true);
      const uploadedUrl = await uploadFileToS3(file, token);
      onUpdateDetails(channelTitle, uploadedUrl);
    } catch (err) {
      console.error('Failed to upload photo:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setEditTitle(channelTitle);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div className="bg-neutral-900/30 border border-neutral-900/40 p-6 md:p-8 rounded-2xl flex flex-col sm:flex-row items-center gap-6 shadow-xl backdrop-blur-sm relative overflow-hidden group">
      <div className={cn("relative shrink-0", isAdmin && "cursor-pointer group/avatar")} onClick={() => isAdmin && fileInputRef.current?.click()}>
        <input 
          type="file" 
          accept="image/*" 
          className="hidden" 
          ref={fileInputRef} 
          onChange={handlePhotoChange} 
          disabled={!isAdmin || isUploading}
        />
        <Avatar name={channelTitle} src={photoUrl} className="w-24 h-24 text-2xl border-2 border-violet-500/20 shadow-lg" />
        {isAdmin && (
          <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-all duration-300">
            {isUploading ? <Loader size="sm" /> : <Camera className="text-white drop-shadow-md" size={24} />}
          </div>
        )}
      </div>
      <div className="flex-1 text-center sm:text-left space-y-2 min-w-0 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-center sm:justify-start w-full">
          {isEditing ? (
            <div className="flex items-center gap-2 max-w-md w-full justify-center sm:justify-start">
              <input
                ref={inputRef}
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                className="bg-neutral-950 text-white text-lg font-semibold px-3 py-1.5 border border-violet-500/40 rounded-xl focus:outline-none focus:ring-1 focus:ring-violet-500 max-w-sm w-full"
                placeholder="Enter channel title"
              />
              <button
                onClick={handleSave}
                disabled={!editTitle.trim() || editTitle.trim() === channelTitle}
                className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg cursor-pointer transition-colors shrink-0 disabled:opacity-40"
                title="Save (Enter)"
              >
                <Check size={16} />
              </button>
              <button
                onClick={handleCancel}
                className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white rounded-lg cursor-pointer transition-colors shrink-0"
                title="Cancel (Esc)"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <>
              <h2
                onClick={() => isAdmin && setIsEditing(true)}
                className={`text-2xl font-bold text-white truncate max-w-md ${isAdmin ? 'cursor-pointer hover:text-neutral-200' : ''}`}
                title={isAdmin ? "Click to rename" : undefined}
              >
                {channelTitle}
              </h2>
              {isAdmin && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="self-center p-1.5 text-violet-400 hover:text-white hover:bg-violet-600/20 border border-violet-500/20 rounded-lg cursor-pointer transition-all shrink-0"
                  title="Rename Channel"
                >
                  <Edit2 size={14} />
                </button>
              )}
            </>
          )}
        </div>
        <div className="flex items-center justify-center sm:justify-start gap-3 text-xs text-neutral-400">
          <span className="flex items-center gap-1 bg-neutral-950 px-2 py-1 rounded-md border border-neutral-900/60">
            <Users size={12} className="text-violet-400" /> {memberCount} Subscribers
          </span>
          <span className="text-neutral-600 font-mono">ID: #{channelId}</span>
        </div>
      </div>
    </div>
  );
};
