import { AlertTriangle, Clock, User, ExternalLink, Trash2, Shield } from 'lucide-react';
import { Avatar, Button } from '@/shared';
import { cn } from '@/shared/lib/utils';
import type { ChannelReport } from '@/entities/admin/api/admin.api';
import { BanActionForm } from './ban-action-form';

interface ReportCardProps {
  report: ChannelReport;
  isSelected: boolean;
  onSelect: () => void;
  banReason: string;
  setBanReason: (val: string) => void;
  banDuration: number;
  setBanDuration: (val: number) => void;
  onBan: (channelId: string) => void;
  isBanning: boolean;
  onDismiss: () => void;
  isDismissing: boolean;
  onView: () => void;
}

export const ReportCard = ({
  report,
  isSelected,
  onSelect,
  banReason,
  setBanReason,
  banDuration,
  setBanDuration,
  onBan,
  isBanning,
  onDismiss,
  isDismissing,
  onView
}: ReportCardProps) => (
  <div className={cn(
    "group transition-all duration-300 border-b border-neutral-900/50 last:border-0",
    isSelected ? "bg-rose-500/[0.03]" : "hover:bg-neutral-900/40"
  )}>
    <div className="p-5 flex items-center gap-6">
      {/* Mini Avatar & Status */}
      <div className="relative shrink-0">
        <div className="relative cursor-pointer" onClick={onView}>
          <Avatar
            name={report.channelTitle}
            size="md"
            className="w-12 h-12 rounded-2xl ring-2 ring-neutral-900 shadow-xl"
          />
          <div className="absolute -top-1 -right-1 bg-rose-500 text-white p-1 rounded-lg border-2 border-neutral-950 shadow-lg">
            <AlertTriangle size={10} />
          </div>
        </div>
      </div>

      {/* Main Info - Compact */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1">
          <h3 
            className="text-base font-bold text-white truncate cursor-pointer hover:text-rose-400 transition-colors"
            onClick={onView}
          >
            {report.channelTitle}
          </h3>
          <span className="text-[9px] font-bold text-neutral-600 bg-neutral-950 px-1.5 py-0.5 rounded-md border border-neutral-800 uppercase tracking-tighter">
            {report.channelId.substring(0, 6)}
          </span>
        </div>

        <div className="flex items-center gap-4 text-[10px] text-neutral-500">
          <span className="flex items-center gap-1">
            <User size={10} className="text-rose-500/60" />
            <span className="text-neutral-400">@{report.reporterUsername}</span>
          </span>
          <span className="flex items-center gap-1">
            <Clock size={10} className="text-neutral-600" />
            <span>{new Date(report.createdAt).toLocaleDateString()}</span>
          </span>
          <div className="flex-1 border-t border-dotted border-neutral-800 mx-2" />
          <p className="text-neutral-400 truncate max-w-[200px] italic">"{report.reason}"</p>
        </div>
      </div>

      {/* Actions - Inline & Minimal */}
      <div className="flex items-center gap-2 shrink-0">
        <button 
          onClick={onView}
          className="p-2.5 text-neutral-500 hover:text-white hover:bg-neutral-800 rounded-xl transition-all"
          title="View Channel"
        >
          <ExternalLink size={16} />
        </button>
        <button 
          onClick={onDismiss}
          disabled={isDismissing}
          className="p-2.5 text-neutral-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
          title="Dismiss Report"
        >
          <Trash2 size={16} />
        </button>
        <div className="w-px h-4 bg-neutral-800 mx-1" />
        <Button
          onClick={onSelect}
          variant="ghost"
          className={cn(
            "h-9 px-4 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all",
            isSelected
              ? "bg-rose-600 hover:bg-rose-500 text-white"
              : "bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800"
          )}
        >
          {isSelected ? 'Cancel' : 'Take Action'}
        </Button>
      </div>
    </div>

    {/* Expandable Form - Slimmer */}
    {isSelected && (
      <div className="px-5 pb-5 animate-in slide-in-from-top-2 duration-300">
        <div className="bg-neutral-950/50 border border-neutral-800/50 rounded-2xl p-4">
          <BanActionForm
            banReason={banReason}
            setBanReason={setBanReason}
            banDuration={banDuration}
            setBanDuration={setBanDuration}
            onBan={() => onBan(report.channelId)}
            isBanning={isBanning}
          />
        </div>
      </div>
    )}
  </div>
);
