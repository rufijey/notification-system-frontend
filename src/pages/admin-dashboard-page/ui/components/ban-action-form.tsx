import { Clock, AlertTriangle } from 'lucide-react';
import { Button, Loader } from '@/shared';
import { cn } from '@/shared/lib/utils';

interface BanActionFormProps {
  banReason: string;
  setBanReason: (val: string) => void;
  banDuration: number;
  setBanDuration: (val: number) => void;
  onBan: () => void;
  isBanning: boolean;
}

export const BanActionForm = ({
  banReason,
  setBanReason,
  banDuration,
  setBanDuration,
  onBan,
  isBanning
}: BanActionFormProps) => {
  const durations = [
    { label: 'Permanent', value: 0 },
    { label: '24 Hours', value: 1 },
    { label: '7 Days', value: 7 },
    { label: '30 Days', value: 30 },
  ];

  return (
    <div className="p-8 bg-neutral-900/50 border-t border-neutral-800/50 animate-in slide-in-from-top-4 duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold px-1">Ban Reason (Public)</label>
          <textarea
            placeholder="Describe why this channel is being banned..."
            value={banReason}
            onChange={(e) => setBanReason(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl p-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500/50 min-h-[120px] resize-none transition-all"
          />
        </div>
        <div className="flex flex-col justify-between py-1">
          <div className="space-y-3">
            <label className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold px-1 flex items-center gap-2">
              <Clock size={12} /> Ban Duration
            </label>
            <div className="grid grid-cols-2 gap-2">
              {durations.map((d) => (
                <button
                  key={d.value}
                  onClick={() => setBanDuration(d.value)}
                  className={cn(
                    "px-4 py-3 rounded-xl text-xs font-bold transition-all border",
                    banDuration === d.value
                      ? "bg-rose-600 border-rose-500 text-white shadow-lg shadow-rose-600/10"
                      : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200"
                  )}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
          <Button
            onClick={onBan}
            disabled={isBanning || !banReason}
            className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-4 rounded-2xl shadow-xl shadow-rose-600/20 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
          >
            {isBanning ? <Loader size="sm" className="border-white" /> : <AlertTriangle size={18} />}
            Confirm Channel Ban
          </Button>
        </div>
      </div>
    </div>
  );
};
