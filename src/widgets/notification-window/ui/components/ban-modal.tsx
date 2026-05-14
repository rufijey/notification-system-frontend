import { useState } from 'react';
import { ShieldAlert, Gavel } from 'lucide-react';
import { ActionModal } from './action-modal';

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
      subtitle={`Restricting "${channelTitle}"`}
      variant="danger"
      icon={<ShieldAlert className="text-rose-500" size={24} />}
      actionLabel="Apply Ban"
      onAction={handleBan}
      isLoading={isLoading}
      isDisabled={!reason.trim()}
    >
      <div className="space-y-6">
        <div className="flex items-start gap-4 p-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl">
          <Gavel className="text-rose-500 shrink-0" size={18} />
          <p className="text-xs text-rose-200/70 leading-relaxed">
            You are about to restrict access to this channel. This action will prevent all messages and visibility for the specified duration.
          </p>
        </div>

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
                className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all cursor-pointer ${
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
      </div>
    </ActionModal>
  );
};
