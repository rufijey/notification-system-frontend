import { useState, useEffect } from 'react';
import { ChannelItem } from '@/entities/notifications';
import { useGetChannelsQuery, useSearchChannelsQuery, useJoinChannelMutation } from '@/entities/notifications/api';
import { ChannelListHeader } from './components/channel-list-header';
import { SearchResultsList } from './components/search-results-list';

interface ChannelListProps {
  userId: string;
  selectedChannelId: string | null;
  onSelectChannel: (channelId: string) => void;
}

export const ChannelList = ({ userId, selectedChannelId, onSelectChannel }: ChannelListProps) => {
  const { data: channels = [], isLoading } = useGetChannelsQuery(userId);
  const [joinChannel, { isLoading: isJoining }] = useJoinChannelMutation();

  const [searchVal, setSearchVal] = useState('');
  const [debouncedSearchVal, setDebouncedSearchVal] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchVal(searchVal);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchVal]);

  const { data: searchResults = [], isFetching: isSearching } = useSearchChannelsQuery(
    debouncedSearchVal,
    { skip: !debouncedSearchVal.trim() }
  );

  const handleJoin = async (channelId: string) => {
    try {
      await joinChannel({ userId, channelId }).unwrap();
      onSelectChannel(channelId);
      setSearchVal('');
    } catch (err) {
      console.error('Failed to join channel:', err);
    }
  };

  if (isLoading) return <div className="p-4 text-neutral-400">Loading channels...</div>;

  const isSearchActive = searchVal.trim().length > 0;

  return (
    <div className="flex flex-col h-full bg-neutral-900 w-full">
      <ChannelListHeader searchVal={searchVal} setSearchVal={setSearchVal} />

      <div className="flex-1 overflow-y-auto">
        {isSearchActive ? (
          <SearchResultsList
            searchResults={searchResults}
            isSearching={isSearching}
            channels={channels}
            selectedChannelId={selectedChannelId}
            onSelectChannel={onSelectChannel}
            onJoin={handleJoin}
            isJoining={isJoining}
          />
        ) : (
          <>
            {channels.length === 0 && <div className="p-4 text-neutral-500">No channels yet</div>}
            {channels.map((channel) => (
              <ChannelItem
                key={channel.channelId}
                channel={channel}
                isSelected={selectedChannelId === channel.channelId}
                onClick={() => onSelectChannel(channel.channelId)}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
};
