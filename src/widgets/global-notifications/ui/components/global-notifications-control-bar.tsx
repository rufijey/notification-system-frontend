import { Search, Filter } from 'lucide-react';

interface GlobalNotificationsControlBarProps {
  searchVal: string;
  setSearchVal: (val: string) => void;
  priorityFilter: 'ALL' | 'HIGH' | 'MEDIUM' | 'LOW';
  setPriorityFilter: (filter: 'ALL' | 'HIGH' | 'MEDIUM' | 'LOW') => void;
}

export const GlobalNotificationsControlBar = ({
  searchVal,
  setSearchVal,
  priorityFilter,
  setPriorityFilter,
}: GlobalNotificationsControlBarProps) => {
  return (
    <div className="p-4 border-b border-neutral-900/30 bg-neutral-900/5 flex flex-wrap gap-3 items-center justify-between shrink-0">
      {/* Search Input */}
      <div className="relative w-full sm:w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
        <input
          type="text"
          placeholder="Search notifications..."
          value={searchVal}
          onChange={(e) => setSearchVal(e.target.value)}
          className="pl-9 pr-4 py-1.5 w-full bg-neutral-900 border border-neutral-900/50 text-xs text-white placeholder-neutral-500 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500/50"
        />
      </div>

      {/* Priority Filter */}
      <div className="flex items-center gap-1">
        <Filter size={13} className="text-neutral-500 mr-2" />
        {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((p) => (
          <button
            key={p}
            onClick={() => setPriorityFilter(p as any)}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
              priorityFilter === p
                ? 'bg-violet-600 text-white shadow-sm'
                : 'bg-neutral-900 border border-neutral-900/40 text-neutral-400 hover:text-white hover:bg-neutral-800/15'
            }`}
          >
            {p.charAt(0) + p.slice(1).toLowerCase()}
          </button>
        ))}
      </div>
    </div>
  );
};
