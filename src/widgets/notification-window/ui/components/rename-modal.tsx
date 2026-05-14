import { useState, useEffect, useRef } from 'react';
import { Avatar, Loader } from '@/shared';
import { Camera, Edit2 } from 'lucide-react';
import { uploadFileToS3 } from '@/shared/api/upload';
import { useSelector } from 'react-redux';
import type { RootState } from '@/app/providers/store';
import { ActionModal } from './action-modal';

interface RenameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRename: (newTitle: string, newPhotoUrl?: string) => void;
  currentTitle: string;
  currentPhotoUrl?: string;
}

export const RenameModal = ({ isOpen, onClose, onRename, currentTitle, currentPhotoUrl }: RenameModalProps) => {
  const [newTitle, setNewTitle] = useState(currentTitle);
  const [photoUrl, setPhotoUrl] = useState(currentPhotoUrl);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const token = useSelector((state: RootState) => state.user.accessToken);

  useEffect(() => {
    if (isOpen) {
      setNewTitle(currentTitle);
      setPhotoUrl(currentPhotoUrl);
    }
  }, [isOpen, currentTitle, currentPhotoUrl]);

  const handleRename = () => {
    const trimmedTitle = newTitle.trim();
    if (trimmedTitle || photoUrl !== currentPhotoUrl) {
      onRename(trimmedTitle, photoUrl);
      onClose();
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    try {
      setIsUploading(true);
      const uploadedUrl = await uploadFileToS3(file, token);
      setPhotoUrl(uploadedUrl);
    } catch (err) {
      console.error('Failed to upload photo:', err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <ActionModal
      isOpen={isOpen}
      onClose={onClose}
      title="Channel Settings"
      subtitle="Update Identity"
      icon={<Edit2 size={20} />}
      variant="primary"
      actionLabel="Save Changes"
      onAction={handleRename}
      isLoading={isUploading}
      isDisabled={(!newTitle.trim() && !photoUrl) || (newTitle.trim() === currentTitle && photoUrl === currentPhotoUrl)}
    >
      <div className="space-y-8">
        <div className="flex flex-col items-center gap-4">
          <div className="relative cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handlePhotoChange} 
            />
            <div className="relative w-24 h-24 rounded-[32px] overflow-hidden border-2 border-neutral-800 transition-all group-hover:border-violet-500/50">
              <Avatar 
                name={newTitle || 'Channel'} 
                src={photoUrl} 
                className="w-full h-full text-2xl" 
              />
              <div className="absolute inset-0 bg-neutral-900/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {isUploading ? <Loader size="sm" /> : <Camera className="text-white" size={24} />}
              </div>
            </div>
          </div>
          <div className="text-center">
            <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-black block">Channel Avatar</span>
            <span className="text-[11px] text-neutral-600 italic">Click to upload new image</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-[10px] text-neutral-500 uppercase tracking-widest font-black px-1">Channel Name</label>
          <input
            type="text"
            placeholder="Enter new channel name"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl p-4 text-sm text-white placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500/50 transition-all h-14"
            autoFocus
          />
        </div>
      </div>
    </ActionModal>
  );
};
