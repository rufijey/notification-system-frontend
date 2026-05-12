import { ArrowLeft } from 'lucide-react';

interface ThreadBarProps {
  onBack: () => void;
}

export const ThreadBar = ({ onBack }: ThreadBarProps) => {
  return (
    <div className="bg-neutral-900 border-b border-neutral-800 p-3 flex items-center shrink-0">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors"
      >
        <ArrowLeft size={16} /> Back to Channel
      </button>
    </div>
  );
};
