import { Bell, ArrowLeft } from 'lucide-react';

interface GlobalNotificationsHeaderProps {
  onBackClick?: () => void;
}

export const GlobalNotificationsHeader = ({ onBackClick }: GlobalNotificationsHeaderProps) => {
  return (
    <div className="h-[72px] px-6 border-b border-neutral-900/30 bg-neutral-900/10 flex items-center shrink-0 gap-3">
      {onBackClick && (
        <button
          onClick={onBackClick}
          className="p-1.5 md:hidden text-neutral-400 hover:text-white hover:bg-neutral-900 border border-neutral-900 rounded-full cursor-pointer transition-all shrink-0 mr-1"
          title="Back to Chats"
        >
          <ArrowLeft size={18} />
        </button>
      )}
      <div className="flex items-center gap-2.5">
        <div className="p-2 bg-violet-600/10 text-violet-400 rounded-xl">
          <Bell size={20} className="animate-pulse" />
        </div>
        <div>
          <h1 className="font-bold text-base text-white">Global Feed</h1>
          <p className="text-xs text-neutral-400">
            Latest alert streams and notifications across your subscriptions
          </p>
        </div>
      </div>
    </div>
  );
};
