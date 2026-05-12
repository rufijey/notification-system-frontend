import { Modal, Button } from '@/shared';

interface LeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLeave: () => void;
}

export const LeaveModal = ({ isOpen, onClose, onLeave }: LeaveModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Unsubscribe from Channel">
      <div className="space-y-4">
        <p className="text-sm text-neutral-400">
          Are you sure you want to unsubscribe from this channel? You won't receive any more notifications from it.
        </p>
        <div className="flex gap-2 justify-end">
          <Button
            className="bg-transparent text-neutral-400 hover:text-white hover:bg-neutral-800"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            className="bg-red-500/20 text-red-400 hover:bg-red-500/30"
            onClick={() => {
              onLeave();
              onClose();
            }}
          >
            Unsubscribe
          </Button>
        </div>
      </div>
    </Modal>
  );
};
