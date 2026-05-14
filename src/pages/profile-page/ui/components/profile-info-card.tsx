import { useState, useEffect, useRef } from 'react';
import { Edit2, Check, X, Shield, Camera } from 'lucide-react';
import { Avatar, Loader } from '@/shared';
import { cn } from '@/shared/lib/utils';
import { uploadFileToS3 } from '@/shared/api/upload';

interface ProfileInfoCardProps {
  currentUserId: string;
  fullName: string | null;
  username?: string;
  avatarUrl: string | null | undefined;
  accessToken: string | null | undefined;
  onUpdateFullName: (newFullName: string) => Promise<void> | void;
  onUpdateAvatar: (newAvatarUrl: string) => Promise<void> | void;
  isOwnProfile?: boolean;
}

export const ProfileInfoCard = ({
  currentUserId,
  fullName,
  username,
  avatarUrl,
  accessToken,
  onUpdateFullName,
  onUpdateAvatar,
  isOwnProfile = true,
}: ProfileInfoCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editValue, setEditValue] = useState(fullName || '');
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditValue(fullName || '');
  }, [fullName]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== fullName) {
      onUpdateFullName(trimmed);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(fullName || '');
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !accessToken) return;

    try {
      setIsUploading(true);
      const newAvatarUrl = await uploadFileToS3(file, accessToken);
      await onUpdateAvatar(newAvatarUrl);
    } catch (err) {
      console.error('Failed to upload avatar', err);
    } finally {
      setIsUploading(false);
    }
  };

  const displayName = fullName || username || currentUserId;

  return (
    <div className={cn(
      "p-6 md:p-8 rounded-2xl flex flex-col sm:flex-row items-center gap-6 shadow-xl backdrop-blur-sm relative overflow-hidden group transition-all duration-500 border",
      isOwnProfile 
        ? "bg-violet-600/[0.04] border-violet-500/30 ring-1 ring-violet-500/10 shadow-violet-500/5" 
        : "bg-neutral-900/30 border-neutral-900/40"
    )}>
      {isOwnProfile && (
        <div className="absolute -right-12 -top-12 w-24 h-24 bg-violet-600/10 blur-3xl rounded-full pointer-events-none" />
      )}
      <div 
        className={cn("relative group/avatar", isOwnProfile && "cursor-pointer")} 
        onClick={() => isOwnProfile && fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          accept="image/*" 
          className="hidden" 
          ref={fileInputRef} 
          onChange={handleAvatarChange} 
        />
        <Avatar name={displayName} src={avatarUrl || undefined} className="w-24 h-24 text-2xl border-2 border-violet-500/20 shrink-0" />
        {isOwnProfile && (
          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
            {isUploading ? <Loader size="sm" /> : <Camera className="text-white" size={24} />}
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
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="bg-neutral-950 text-white text-lg font-semibold px-3 py-1.5 border border-violet-500/40 rounded-xl focus:outline-none focus:ring-1 focus:ring-violet-500 max-w-sm w-full"
                placeholder="Enter your full name"
              />
              <button
                onClick={handleSave}
                disabled={!editValue.trim() || editValue.trim() === fullName}
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
                onClick={() => isOwnProfile && setIsEditing(true)}
                className={cn(
                  "text-2xl font-bold text-white truncate max-w-md",
                  isOwnProfile && "cursor-pointer hover:text-neutral-200"
                )}
                title={isOwnProfile ? "Click to change your full name" : undefined}
              >
                {displayName}
              </h2>
              {isOwnProfile && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="self-center p-1.5 text-violet-400 hover:text-white hover:bg-violet-600/20 border border-violet-500/20 rounded-lg cursor-pointer transition-all shrink-0"
                  title="Edit Full Name"
                >
                  <Edit2 size={14} />
                </button>
              )}
            </>
          )}
        </div>
        <div className="flex items-center justify-center sm:justify-start gap-3 text-xs text-neutral-400">
          <span className="flex items-center gap-1 bg-neutral-950 px-2 py-1 rounded-md border border-neutral-900/60 font-mono">
            <Shield size={12} className="text-violet-400" /> @{username || currentUserId}
          </span>
        </div>
      </div>
    </div>
  );
};
