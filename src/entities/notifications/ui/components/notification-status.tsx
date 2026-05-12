import { Check, CheckCheck, WifiOff, RefreshCw } from 'lucide-react';
import { Loader } from '@/shared';

interface NotificationStatusProps {
  isSending: boolean;
  status: string;
  sequence: number;
  senderId: string;
  members: any[];
  onRetry?: () => void;
}

export const NotificationStatus = ({
  isSending,
  status,
  sequence,
  senderId,
  members,
  onRetry,
}: NotificationStatusProps) => {
  if (isSending) {
    return <Loader className="h-2.5 w-2.5 text-neutral-400" />;
  }

  if (status === 'FAILED_OFFLINE') {
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRetry?.();
        }}
        className="flex items-center gap-1.5 text-red-400 hover:text-red-300 transition-colors bg-red-500/10 hover:bg-red-500/20 px-2 py-0.5 rounded-full border border-red-500/20 text-[9px] font-bold cursor-pointer select-none"
        title="Sending failed. Click to retry."
      >
        <WifiOff size={10} />
        <span>Sending failed</span>
        <RefreshCw size={8} className="transition-transform group-hover:rotate-180 duration-500" />
      </button>
    );
  }

  const readBy = members.filter(
    (m) => m.lastReadSequence >= sequence && m.userId !== senderId
  );

  if (status === 'READ' || readBy.length > 0) {
    return (
      <div className="flex items-center gap-1 group/status relative">
        <CheckCheck size={11} className="text-blue-400" />
        {readBy.length > 0 && (
          <div className="absolute bottom-full right-0 mb-1.5 hidden group-hover/status:flex flex-col bg-neutral-900 text-neutral-300 text-[10px] p-1.5 rounded-md shadow-xl border border-neutral-700/50 min-w-[120px] z-20 backdrop-blur-md">
            <span className="text-neutral-500 font-medium mb-1 px-1">Read by</span>
            <div className="max-h-[100px] overflow-y-auto pr-1 custom-scrollbar space-y-0.5">
              {readBy.map((m) => (
                <div
                  key={m.userId}
                  className="flex items-center gap-1.5 px-1 py-0.5 rounded hover:bg-neutral-800/50"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                  <span className="truncate">{m.fullName || m.username || m.userId}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (status === 'PENDING' || status === 'DELIVERED') {
    return <Check size={11} className="text-neutral-400" />;
  }

  return null;
};
