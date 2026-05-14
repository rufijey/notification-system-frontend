import { Flag, Ban } from 'lucide-react';

interface AdminStatsProps {
  totalReports: number;
  bannedCount: number;
  currentTab: 'reports' | 'bans';
  onTabChange: (tab: 'reports' | 'bans') => void;
}

export const AdminStats = ({ totalReports, bannedCount, currentTab, onTabChange }: AdminStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <button 
        onClick={() => onTabChange('reports')}
        className={`text-left group transition-all duration-300 ${
          currentTab === 'reports' 
            ? 'bg-rose-500/10 border-rose-500/40 ring-1 ring-rose-500/20' 
            : 'bg-neutral-900/40 border-neutral-800/40 hover:bg-neutral-900/60'
        } border p-6 rounded-[32px] backdrop-blur-md`}
      >
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl transition-colors ${
            currentTab === 'reports' ? 'bg-rose-500/20 text-rose-500' : 'bg-amber-500/10 text-amber-500'
          }`}>
            <Flag size={20} />
          </div>
          <div>
            <div className="text-2xl font-black text-white leading-none">{totalReports}</div>
            <div className="text-[10px] text-neutral-500 uppercase tracking-widest font-black mt-1 group-hover:text-neutral-400 transition-colors">Active Reports</div>
          </div>
        </div>
      </button>

      <button 
        onClick={() => onTabChange('bans')}
        className={`text-left group transition-all duration-300 ${
          currentTab === 'bans' 
            ? 'bg-rose-500/10 border-rose-500/40 ring-1 ring-rose-500/20' 
            : 'bg-neutral-900/40 border-neutral-800/40 hover:bg-neutral-900/60'
        } border p-6 rounded-[32px] backdrop-blur-md`}
      >
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl transition-colors ${
            currentTab === 'bans' ? 'bg-rose-500/20 text-rose-500' : 'bg-rose-500/10 text-rose-500'
          }`}>
            <Ban size={20} />
          </div>
          <div>
            <div className="text-2xl font-black text-white leading-none">{bannedCount}</div>
            <div className="text-[10px] text-neutral-500 uppercase tracking-widest font-black mt-1 group-hover:text-neutral-400 transition-colors">Channels Banned</div>
          </div>
        </div>
      </button>
    </div>
  );
};
