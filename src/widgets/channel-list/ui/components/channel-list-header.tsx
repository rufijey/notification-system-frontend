import { Search, X } from 'lucide-react';
import { Input } from '@/shared';

interface ChannelListHeaderProps {
  searchVal: string;
  setSearchVal: (val: string) => void;
}

export const ChannelListHeader = ({ searchVal, setSearchVal }: ChannelListHeaderProps) => {
  return (
    <div className="p-4 border-b border-neutral-800 space-y-3 shrink-0">
      <h2 className="text-xl font-bold text-white">Channels</h2>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
        <Input
          placeholder="Search channels..."
          value={searchVal}
          onChange={(e) => setSearchVal(e.target.value)}
          className="pl-9 pr-8 h-9 bg-neutral-800 border-none text-xs text-white placeholder-neutral-500 rounded-lg focus:ring-1 focus:ring-neutral-700 w-full"
        />
        {searchVal && (
          <button
            onClick={() => setSearchVal('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};
