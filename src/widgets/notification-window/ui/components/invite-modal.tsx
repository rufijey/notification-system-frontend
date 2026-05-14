import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { ActionModal } from './action-modal';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (memberId: string) => void;
}

export const InviteModal = ({ isOpen, onClose, onInvite }: InviteModalProps) => {
  const [inviteUserId, setInviteUserId] = useState('');

  const handleInvite = () => {
    if (inviteUserId.trim()) {
      onInvite(inviteUserId.trim());
      setInviteUserId('');
      onClose();
    }
  };

  return (
    <ActionModal
      isOpen={isOpen}
      onClose={onClose}
      title="Invite Member"
      subtitle="Expand Channel"
      icon={<UserPlus size={20} />}
      variant="primary"
      actionLabel="Send Invitation"
      onAction={handleInvite}
      isDisabled={!inviteUserId.trim()}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-[10px] text-neutral-500 uppercase tracking-widest font-black px-1">
            User Identifier
          </label>
          <input
            type="text"
            placeholder="Enter username (e.g. johndoe)"
            value={inviteUserId}
            onChange={(e) => setInviteUserId(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl p-4 text-sm text-white placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500/50 transition-all h-14"
            autoFocus
          />
        </div>
        <p className="text-[11px] text-neutral-500 px-1 italic">
          The user will be added to the channel immediately as a subscriber.
        </p>
      </div>
    </ActionModal>
  );
};
