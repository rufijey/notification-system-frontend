import { useState } from 'react';
import { MessageSquarePlus } from 'lucide-react';
import { Button, Input } from '@/shared';

interface AddContactFormProps {
  onAdd: (contactId: string) => void;
}

export const AddContactForm = ({ onAdd }: AddContactFormProps) => {
  const [newContactId, setNewContactId] = useState('');

  const handleAdd = () => {
    if (newContactId.trim()) {
      onAdd(newContactId.trim());
      setNewContactId('');
    }
  };

  return (
    <div className="p-4 bg-neutral-900 border-b border-neutral-800">
      <div className="flex gap-2">
        <Input
          placeholder="Contact ID"
          value={newContactId}
          onChange={(e) => setNewContactId(e.target.value)}
          className="h-9 bg-neutral-800 border-none text-xs text-white"
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <Button
          className="h-9 px-3 bg-neutral-800 hover:bg-neutral-700"
          onClick={handleAdd}
        >
          <MessageSquarePlus size={16} />
        </Button>
      </div>
    </div>
  );
};
