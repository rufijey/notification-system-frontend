import { Bell } from 'lucide-react';

export const GlobalNotificationsHeader = () => {
  return (
    <div className="h-[72px] px-6 border-b border-neutral-900/30 bg-neutral-900/10 flex items-center justify-between shrink-0">
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
