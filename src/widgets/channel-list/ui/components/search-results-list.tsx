import { Plus } from 'lucide-react';
import { Button, Avatar, Loader } from '@/shared';
import { ChannelItem } from '@/entities/notifications';
import { cn } from '../../../../shared/lib/utils';
import type { Channel } from '@/entities/notifications/model/types';

interface SearchResultsListProps {
  searchResults: { channelId: string; title: string; isMember: boolean }[];
  isSearching: boolean;
  channels: Channel[];
  selectedChannelId: string | null;
  onSelectChannel: (channelId: string) => void;
  onJoin: (channelId: string) => void;
  isJoining: boolean;
}

export const SearchResultsList = ({
  searchResults,
  isSearching,
  channels,
  selectedChannelId,
  onSelectChannel,
  onJoin,
  isJoining,
}: SearchResultsListProps) => {
  return (
    <div className="p-2 space-y-1">
      <div className="px-2 py-1 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider flex items-center justify-between">
        <span>Search Results</span>
        {isSearching && <Loader size="sm" className="h-3 w-3 text-neutral-400" />}
      </div>

      {!isSearching && searchResults.length === 0 && (
        <div className="p-4 text-center text-neutral-500 text-xs">No channels found</div>
      )}

      {searchResults.map((result) => {
        const existingChannel = channels.find((c) => c.channelId === result.channelId);

        if (existingChannel) {
          return (
            <ChannelItem
              key={result.channelId}
              channel={existingChannel}
              isSelected={selectedChannelId === result.channelId}
              onClick={() => onSelectChannel(result.channelId)}
            />
          );
        }

        return (
          <div
            key={result.channelId}
            onClick={() => onSelectChannel(result.channelId)}
            className={cn(
              "flex items-center gap-3 p-4 hover:bg-neutral-800 transition-colors border-b border-neutral-800/50 cursor-pointer relative group",
              selectedChannelId === result.channelId && "bg-neutral-800"
            )}
          >
            <Avatar name={result.title} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-white text-sm truncate">{result.title}</div>
                  <div className="text-[11px] text-neutral-500 truncate mt-0.5 font-mono">
                    <span className="bg-neutral-900 px-1.5 py-0.5 rounded text-neutral-400">
                      #{result.channelId}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onJoin(result.channelId);
                  }}
                  disabled={isJoining}
                  className="h-8 px-3.5 bg-violet-600 hover:bg-violet-500 active:scale-[0.97] text-xs rounded-xl font-bold text-white flex items-center gap-1.5 shrink-0 transition-all shadow-md shadow-violet-600/15"
                >
                  <Plus className="h-3.5 w-3.5" /> Join
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
