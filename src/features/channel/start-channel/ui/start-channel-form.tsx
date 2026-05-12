import { useState } from 'react';
import { MessageSquarePlus, Users, Hash } from 'lucide-react';
import { Button, Input } from '@/shared';
import { useCreateChannelMutation, useJoinChannelMutation } from '@/entities/notifications/api';
import { useSelector } from 'react-redux';
import { type RootState } from '../../../../app/store';

interface StartChannelFormProps {
  onStart: (contactId: string) => void;
}

export const StartChannelForm = ({ onStart }: StartChannelFormProps) => {
  const currentUserId = useSelector((state: RootState) => state.user.currentUserId);
  const [joinId, setJoinId] = useState('');
  const [title, setTitle] = useState('');
  const [customId, setCustomId] = useState('');
  const [mode, setMode] = useState<'GROUP' | 'JOIN'>('GROUP');
  const [error, setError] = useState<string | null>(null);
  const [createChannel] = useCreateChannelMutation();
  const [joinChannel] = useJoinChannelMutation();

  const handleModeChange = (newMode: 'GROUP' | 'JOIN') => {
    setMode(newMode);
    setError(null);
  };

  const handleAction = async () => {
    if (!currentUserId) return;
    setError(null);

    try {
      if (mode === 'JOIN') {
        if (!joinId.trim()) return;
        await joinChannel({ userId: currentUserId, channelId: joinId.trim() }).unwrap();
        setJoinId('');
      } else if (mode === 'GROUP') {
        const channel = await createChannel({
          userId: currentUserId,
          memberIds: [],
          title: title.trim() || 'New Channel',
          id: customId.trim() || undefined,
        }).unwrap();
        onStart(channel.channelId);
        setTitle('');
        setCustomId('');
      }
    } catch (err: any) {
      console.error('Action failed:', err);
      if (err?.status === 409 || err?.data?.statusCode === 409) {
        setError('This Channel ID is already taken. Please choose a different one.');
      } else if (err?.status === 404 || err?.data?.statusCode === 404) {
        setError('Channel not found.');
      } else {
        setError(err?.data?.message || err?.message || 'Action failed. Please try again.');
      }
    }
  };

  return (
    <div className="p-4 bg-neutral-900 border-b border-neutral-800 space-y-3">
      <div className="flex bg-neutral-800 rounded-lg p-1">
        <button
          onClick={() => handleModeChange('GROUP')}
          className={`flex-1 flex justify-center py-1 rounded-md transition-colors ${mode === 'GROUP' ? 'bg-neutral-700 text-white' : 'text-neutral-500'}`}
          title="Create Channel"
        >
          <Users size={16} />
        </button>
        <button
          onClick={() => handleModeChange('JOIN')}
          className={`flex-1 flex justify-center py-1 rounded-md transition-colors ${mode === 'JOIN' ? 'bg-neutral-700 text-white' : 'text-neutral-500'}`}
          title="Join by ID"
        >
          <Hash size={16} />
        </button>
      </div>

      <div className="space-y-2">
        {mode === 'GROUP' && (
          <>
            <Input
              placeholder="Channel Title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setError(null);
              }}
              className="h-9 bg-neutral-800 border-none text-xs text-white"
              onKeyDown={(e) => e.key === 'Enter' && handleAction()}
            />
            <Input
              placeholder="Channel unique identifier"
              value={customId}
              onChange={(e) => {
                setCustomId(e.target.value);
                setError(null);
              }}
              className="h-9 bg-neutral-800 border-none text-xs text-white"
              onKeyDown={(e) => e.key === 'Enter' && handleAction()}
            />
          </>
        )}
        {mode === 'JOIN' && (
          <Input
            placeholder="Channel ID"
            value={joinId}
            onChange={(e) => {
              setJoinId(e.target.value);
              setError(null);
            }}
            className="h-9 bg-neutral-800 border-none text-xs text-white"
            onKeyDown={(e) => e.key === 'Enter' && handleAction()}
          />
        )}

        {error && (
          <div className="text-red-400 text-[11px] font-semibold px-1 py-0.5">
            {error}
          </div>
        )}

        <Button
          className="w-full h-9 bg-neutral-700 hover:bg-neutral-600"
          onClick={handleAction}
          disabled={mode === 'JOIN' && !joinId.trim()}
        >
          {mode === 'JOIN' ? 'Join Channel' : <><MessageSquarePlus size={14} className="mr-1.5" /> Create Channel</>}
        </Button>
      </div>
    </div>
  );
};
