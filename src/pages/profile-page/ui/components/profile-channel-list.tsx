import { MessageSquare, ShieldCheck, ShieldAlert, ArrowRight } from 'lucide-react';
import { Avatar } from '@/shared';
import { cn } from '@/shared/lib/utils';
import type { Channel } from '@/entities/notifications/model/types';

interface ProfileChannelListProps {
  channels: Channel[];
  onSelectChannel: (channelId: string) => void;
}

export const ProfileChannelList = ({
  channels,
  onSelectChannel,
}: ProfileChannelListProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
        <h3 className="text-sm font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-2">
          Your Channels ({channels.length})
        </h3>
        <span className="text-[10px] text-violet-400 font-semibold bg-violet-600/10 px-2 py-0.5 border border-violet-500/20 rounded-full uppercase tracking-wider">
          Active memberships
        </span>
      </div>

      {channels.length === 0 ? (
        <div className="bg-neutral-900/10 border border-neutral-900/50 p-12 rounded-xl text-center space-y-2">
          <MessageSquare className="mx-auto text-neutral-600 w-12 h-12" />
          <h4 className="text-neutral-300 font-medium text-sm">No channels found</h4>
          <p className="text-xs text-neutral-500 max-w-xs mx-auto">
            You don't belong to any channels yet. Join a public channel or create a new one to get started!
          </p>
        </div>
      ) : (
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {channels.map((channel) => {
            return (
              <div
                key={channel.channelId}
                onClick={() => onSelectChannel(channel.channelId)}
                className="bg-neutral-900/40 border border-neutral-900/40 p-4 rounded-xl flex items-center gap-3 relative transition-all group shadow-sm hover:shadow-md hover:border-violet-500/20 cursor-pointer"
                title={`Go to ${channel.title || 'Channel'}`}
              >
                <Avatar name={channel.title || 'Channel'} className="w-10 h-10 text-sm" />
                
                <div className="flex-1 min-w-0 pr-1">
                  <p className="font-semibold text-neutral-200 text-sm truncate group-hover:text-violet-400 transition-colors">
                    {channel.title || 'Unnamed Channel'}
                  </p>
                  
                  {/* Role Badge */}
                  <div className="mt-2 flex items-center">
                    <span
                      className={cn(
                        "text-[9px] font-black uppercase px-2 py-0.5 rounded-md tracking-wider flex items-center gap-1",
                        channel.role === 'ADMIN'
                          ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          : channel.role === 'PUBLISHER'
                          ? "bg-violet-500/10 text-violet-400 border border-violet-500/20"
                          : "bg-neutral-950 text-neutral-500 border border-neutral-900"
                      )}
                    >
                      {channel.role === 'ADMIN' && <ShieldAlert size={10} />}
                      {channel.role === 'PUBLISHER' && <ShieldCheck size={10} />}
                      {channel.role}
                    </span>
                  </div>
                </div>

                <div className="text-neutral-500 group-hover:text-violet-400 transition-colors shrink-0">
                  <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
