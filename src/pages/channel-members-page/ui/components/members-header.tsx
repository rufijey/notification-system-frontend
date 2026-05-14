import { ArrowLeft, Hash } from 'lucide-react';
import { Button } from '@/shared';

interface MembersHeaderProps {
  onBack: () => void;
}

export const MembersHeader = ({ onBack }: MembersHeaderProps) => {
  return (
    <div className="h-[72px] px-6 border-b border-neutral-900/30 bg-neutral-900/10 flex items-center gap-3 shrink-0 justify-between">
      <div className="flex items-center gap-3 overflow-hidden">
        <button
          onClick={onBack}
          className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-900 border border-neutral-900 rounded-full cursor-pointer transition-all shrink-0"
          title="Back to Chat"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="bg-emerald-600 text-white text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded flex items-center gap-1 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
              <Hash size={10} />
              Channel
            </span>
            <h1 className="font-bold text-base text-white truncate leading-none">Channel Info</h1>
          </div>
          <p className="text-[10px] text-neutral-500 hidden sm:block truncate uppercase tracking-tight">
            View participants, manage preferences, and configure broadcast rights
          </p>
        </div>
      </div>
      <Button
        onClick={onBack}
        className="text-xs bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800"
      >
        Back to Chat
      </Button>
    </div>
  );
};
