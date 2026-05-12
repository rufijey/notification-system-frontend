import { useState, useEffect } from 'react';
import { Modal, Input, Button } from '@/shared';

interface RenameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRename: (newTitle: string) => void;
  currentTitle: string;
}

export const RenameModal = ({ isOpen, onClose, onRename, currentTitle }: RenameModalProps) => {
  const [newTitle, setNewTitle] = useState(currentTitle);

  useEffect(() => {
    if (isOpen) {
      setNewTitle(currentTitle);
    }
  }, [isOpen, currentTitle]);

  const handleRename = () => {
    if (newTitle.trim() && newTitle.trim() !== currentTitle) {
      onRename(newTitle.trim());
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Rename Channel">
      <div className="space-y-4">
        <Input
          placeholder="Enter new channel name"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
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
          <Button onClick={handleRename} disabled={!newTitle.trim() || newTitle.trim() === currentTitle}>
            Save
          </Button>
        </div>
      </div>
    </Modal>
  );
};
