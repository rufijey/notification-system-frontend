import { useState } from 'react';
import { Flag, AlertTriangle } from 'lucide-react';
import { ActionModal } from './action-modal';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReport: (reason: string) => Promise<void>;
}

export const ReportModal = ({ isOpen, onClose, onReport }: ReportModalProps) => {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) return;
    setIsSubmitting(true);
    try {
      await onReport(reason);
      setReason('');
      onClose();
    } catch (err) {
      console.error('Report failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ActionModal
      isOpen={isOpen}
      onClose={onClose}
      title="Report Channel"
      subtitle="Submit Violation"
      icon={<Flag size={20} />}
      variant="danger"
      actionLabel="Submit Report"
      onAction={handleSubmit}
      isLoading={isSubmitting}
      isDisabled={!reason.trim()}
    >
      <div className="flex items-start gap-4 p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl mb-6">
        <AlertTriangle className="text-amber-500 shrink-0" size={18} />
        <p className="text-xs text-amber-200/70 leading-relaxed">
          Please provide a clear reason for your report. Moderators will review the content of this channel shortly.
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] text-neutral-500 uppercase tracking-widest font-black px-1">
          Reason for Report
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="E.g. Inappropriate content, spam, harassment..."
          className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl p-4 text-sm text-white placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500/50 transition-all resize-none h-32"
          autoFocus
        />
      </div>
    </ActionModal>
  );
};
