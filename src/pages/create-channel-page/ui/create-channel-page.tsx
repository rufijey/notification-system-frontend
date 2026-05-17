import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, ShieldCheck, HelpCircle, ArrowLeft, Camera } from 'lucide-react';
import type { RootState } from '@/app/providers/store';
import { Sidebar } from '@/widgets/sidebar';
import { Button, Input, Avatar, Loader } from '@/shared';
import { useCreateChannelMutation } from '@/entities/notifications/api';
import { PageRoutes } from '@/shared/config';
import { uploadFileToS3 } from '@/shared/api/upload';
import { useRef } from 'react';

export const CreateChannelPage = () => {
  const currentUserId = useSelector((state: RootState) => state.user.currentUserId);
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [customId, setCustomId] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const token = useSelector((state: RootState) => state.user.accessToken);

  const [createChannel] = useCreateChannelMutation();

  if (!currentUserId) {
    return null;
  }

  const handleSelectContact = (id: string) => {
    navigate(`${PageRoutes.channelBase}/${id}`);
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !title.trim()) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const channel = await createChannel({
        userId: currentUserId,
        memberIds: [],
        title: title.trim(),
        id: customId.trim() || undefined,
        photoUrl,
      }).unwrap();
      navigate(`${PageRoutes.channelBase}/${channel.channelId}`);
    } catch (err: any) {
      console.error('Operation failed:', err);
      if (err?.status === 409 || err?.data?.statusCode === 409) {
        setError('This Channel ID is already taken. Please choose a different one.');
      } else {
        setError(err?.data?.message || err?.message || 'Operation failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen bg-neutral-950 text-white overflow-hidden w-full">
      <Sidebar
        selectedChannelId={null}
        onSelectChannel={handleSelectContact}
        className="hidden md:flex"
      />

      {/* Main Content Area (Full page creator) */}
      <div className="flex-1 overflow-y-auto bg-neutral-950 flex flex-col justify-center items-center p-6 relative w-full h-full">
        {/* Mobile back button */}
        <button
          onClick={() => navigate(PageRoutes.channelBase)}
          className="absolute top-4 left-4 md:hidden p-2 text-neutral-400 hover:text-white hover:bg-neutral-900 border border-neutral-900 rounded-full cursor-pointer transition-all"
          title="Back to Chats"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="max-w-xl w-full space-y-8 bg-neutral-900/40 border border-neutral-900/30 p-8 rounded-2xl shadow-xl backdrop-blur-sm">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-violet-600/10 text-violet-500 flex items-center justify-center mx-auto mb-2 border border-violet-500/10">
              <Users size={24} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Create a New Channel
            </h1>
            <p className="text-xs text-neutral-400">
              Launch your own secure notification stream to broadcast updates
            </p>
          </div>

          <div className="flex flex-col items-center gap-2 pb-2">
            <div className="relative cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handlePhotoChange} 
              />
              <Avatar name={title || 'Channel'} src={photoUrl} className="w-20 h-20 text-xl border border-neutral-800 bg-neutral-950 shadow-inner" />
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {isUploading ? <Loader size="sm" /> : <Camera className="text-white" size={20} />}
              </div>
            </div>
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-tighter">Add channel photo</span>
          </div>

          {/* Form */}
          <form onSubmit={handleCreate} className="space-y-5">
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                  Channel Title
                </label>
                <Input
                  placeholder="e.g. Production Alerts"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setError(null);
                  }}
                  required
                  className="h-10 bg-neutral-950 border border-neutral-900/40 text-sm text-white placeholder-neutral-500 focus:ring-1 focus:ring-violet-500 rounded-lg"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                  Channel unique identifier
                </label>
                <Input
                  placeholder="e.g. prod-alerts"
                  value={customId}
                  onChange={(e) => {
                    setCustomId(e.target.value);
                    setError(null);
                  }}
                  className="h-10 bg-neutral-950 border border-neutral-900/40 text-sm text-white placeholder-neutral-500 focus:ring-1 focus:ring-violet-500 rounded-lg font-mono text-xs"
                />
                <p className="text-[10px] text-neutral-500 leading-normal flex items-center gap-1">
                  <HelpCircle size={10} className="shrink-0" />
                  If left blank, a random unique identifier will be generated automatically.
                </p>
              </div>
            </div>

            {error && (
              <div className="text-red-400 text-[11px] font-semibold px-1 py-0.5">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="w-full h-10 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-bold transition-all duration-300 rounded-lg flex items-center justify-center gap-2 active:scale-[0.98] shadow-lg shadow-violet-600/15 text-xs uppercase tracking-wider cursor-pointer"
            >
              <Plus size={16} />
              <span>{isSubmitting ? 'Creating...' : 'Create New Channel'}</span>
            </Button>
          </form>

          {/* Info Card footer */}
          <div className="p-4 rounded-xl bg-violet-600/5 border border-violet-500/10 flex gap-3 text-xs leading-normal">
            <ShieldCheck size={18} className="text-violet-500 shrink-0" />
            <div className="space-y-1">
              <p className="font-bold text-white">Broadcast Permissions & Security</p>
              <p className="text-neutral-400">
                Only creators of a channel are granted Admin roles with full broadcast rights.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
