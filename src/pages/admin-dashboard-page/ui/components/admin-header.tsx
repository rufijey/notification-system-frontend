import { Shield, Search } from 'lucide-react';

interface AdminHeaderProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
}

export const AdminHeader = ({ searchQuery, setSearchQuery }: AdminHeaderProps) => (
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-neutral-900">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 bg-rose-600/10 rounded-2xl flex items-center justify-center text-rose-500 shadow-inner">
        <Shield size={24} />
      </div>
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">Admin Dashboard</h1>
        <p className="text-xs text-neutral-500 uppercase tracking-widest font-semibold">Security & Moderation</p>
      </div>
    </div>

    <div className="flex items-center gap-4">
      <div className="relative group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500 group-focus-within:text-rose-500 transition-colors" />
        <input
          type="text"
          placeholder="Search reports..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-neutral-900 border border-neutral-800 text-sm text-white pl-10 pr-4 py-2.5 rounded-xl w-64 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500/50 transition-all placeholder:text-neutral-600"
        />
      </div>
    </div>
  </div>
);
