import { Shield, Search, ArrowLeft } from 'lucide-react';

interface AdminHeaderProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  onBackClick?: () => void;
}

export const AdminHeader = ({ searchQuery, setSearchQuery, onBackClick }: AdminHeaderProps) => (
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 pb-6 md:pb-8 border-b border-neutral-900">
    <div className="flex items-center gap-3 md:gap-4">
      {onBackClick && (
        <button
          onClick={onBackClick}
          className="p-2 md:hidden text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-full cursor-pointer transition-colors shrink-0"
        >
          <ArrowLeft size={20} />
        </button>
      )}
      <div className="w-10 h-10 md:w-12 md:h-12 bg-rose-600/10 rounded-xl md:rounded-2xl flex items-center justify-center text-rose-500 shadow-inner shrink-0">
        <Shield size={20} className="md:w-6 md:h-6" />
      </div>
      <div className="min-w-0">
        <h1 className="text-xl md:text-3xl font-black text-white tracking-tight truncate">Admin Dashboard</h1>
        <p className="text-[10px] md:text-xs text-neutral-500 uppercase tracking-widest font-semibold truncate">Security & Moderation</p>
      </div>
    </div>

    <div className="flex items-center gap-4 w-full md:w-auto">
      <div className="relative group w-full md:w-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500 group-focus-within:text-rose-500 transition-colors" />
        <input
          type="text"
          placeholder="Search reports..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-neutral-900 border border-neutral-800 text-sm text-white pl-10 pr-4 py-2.5 rounded-xl w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500/50 transition-all placeholder:text-neutral-600"
        />
      </div>
    </div>
  </div>
);
