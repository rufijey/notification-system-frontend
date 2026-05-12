import { ArrowLeft } from 'lucide-react';
import { Button } from '@/shared';

interface MembersHeaderProps {
  onBack: () => void;
}

export const MembersHeader = ({ onBack }: MembersHeaderProps) => {
  return (
    <div className="h-[72px] px-6 border-b border-neutral-900/30 bg-neutral-900/10 flex items-center gap-3 shrink-0 justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-900 border border-neutral-900 rounded-full cursor-pointer transition-all shrink-0"
          title="Back to Chat"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="font-bold text-base text-white">Channel Info</h1>
          <p className="text-xs text-neutral-400 hidden sm:block">
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
