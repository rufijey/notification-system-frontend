import { useState } from 'react';
import { ShieldAlert, Gavel } from 'lucide-react';
import { ActionModal } from './action-modal';
import { Button } from '@/shared';

interface BanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBan: (reason: string, durationDays?: number) => Promise<void>;
  channelTitle: string;
}

export const BanModal = ({ isOpen, onClose, onBan, channelTitle }: BanModalProps) => {
  const [reason, setReason] = useState('');
  const [duration, setDuration] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleBan = async () => {
    if (!reason.trim()) return;
    setIsLoading(true);
    try {
      await onBan(reason, duration > 0 ? duration : undefined);
      onClose();
    } catch (error) {
      console.error('Ban failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ActionModal
      isOpen={isOpen}
      onClose={onClose}
      title="Ban Channel"
      description={`You are about to restrict access to "${channelTitle}". This action will prevent all messages and visibility for the specified duration.`}
      variant="danger"
      icon={<ShieldAlert className="text-rose-500" size={24} />}
    >
      <div className="space-y-6 mt-4">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1">
            Violation Reason
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Describe the violation..."
            className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl p-4 text-sm text-white placeholder:text-neutral-700 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500/50 transition-all min-h-[100px] resize-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1">
            Ban Duration
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[0, 1, 7, 30].map((days) => (
              <button
                key={days}
                onClick={() => setDuration(days)}
                className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                  duration === days
                    ? 'bg-rose-500 border-rose-400 text-white shadow-lg shadow-rose-500/20'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-500 hover:border-neutral-700'
                }`}
              >
                {days === 0 ? 'Permanent' : `${days}d`}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            variant="ghost"
            onClick={onClose}
            className="flex-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 rounded-xl py-6 font-bold"
          >
            Cancel
          </Button>
          <Button
            onClick={handleBan}
            disabled={!reason.trim() || isLoading}
            className="flex-1 bg-rose-600 hover:bg-rose-500 text-white rounded-xl py-6 font-bold shadow-xl shadow-rose-600/20 gap-2"
          >
            <Gavel size={18} />
            {isLoading ? 'Processing...' : 'Apply Ban'}
          </Button>
        </div>
      </div>
    </ActionModal>
  );
};
