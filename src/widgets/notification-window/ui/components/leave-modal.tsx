import { BellOff } from 'lucide-react';
import { ActionModal } from './action-modal';

interface LeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLeave: () => void;
}

export const LeaveModal = ({ isOpen, onClose, onLeave }: LeaveModalProps) => {
  return (
    <ActionModal
      isOpen={isOpen}
      onClose={onClose}
      title="Unsubscribe"
      subtitle="Stop receiving updates"
      icon={<BellOff size={20} />}
      variant="danger"
      actionLabel="Unsubscribe"
      onAction={() => {
        onLeave();
        onClose();
      }}
    >
      <div className="space-y-4">
        <p className="text-sm text-neutral-400 leading-relaxed">
          Are you sure you want to unsubscribe from this channel? 
          You won't receive any more notifications from this source until you subscribe again.
        </p>
        <div className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl">
          <p className="text-[11px] text-rose-300/60 italic">
            Note: You can always search for the channel and join back later.
          </p>
        </div>
      </div>
    </ActionModal>
  );
};
