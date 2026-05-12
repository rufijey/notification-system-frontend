import { useState } from 'react';
import { Modal, Input, Button } from '@/shared';

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
    <Modal isOpen={isOpen} onClose={onClose} title="Invite User">
      <div className="space-y-4">
        <Input
          placeholder="Enter Username (e.g. johndoe)"
          value={inviteUserId}
          onChange={(e) => setInviteUserId(e.target.value)}
          className="w-full bg-neutral-950 border-neutral-800 text-sm h-10"
          autoFocus
        />
        <div className="flex gap-2 justify-end">
          <Button
            className="bg-transparent text-neutral-400 hover:text-white hover:bg-neutral-800"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button onClick={handleInvite}>Invite</Button>
        </div>
      </div>
    </Modal>
  );
};
