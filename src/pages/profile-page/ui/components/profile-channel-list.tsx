import { MessageSquare, ShieldCheck, ShieldAlert, ArrowRight } from 'lucide-react';
import { Avatar } from '@/shared';
import { cn } from '@/shared/lib/utils';
import type { Channel } from '@/entities/notifications/model/types';

interface ProfileChannelListProps {
  channels: Channel[];
  onSelectChannel: (channelId: string) => void;
  isOwnProfile?: boolean;
}

export const ProfileChannelList = ({
  channels,
  onSelectChannel,
  isOwnProfile = true,
}: ProfileChannelListProps) => {
  return (
    <div className="mt-10 pt-10 border-t border-neutral-900/60">
      <div className="bg-neutral-950/30 rounded-3xl p-6 md:p-8 border border-neutral-900/40 shadow-inner space-y-6">
        <div className="flex items-center justify-between border-b border-neutral-800/50 pb-4">
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <MessageSquare size={16} className="text-violet-500" />
              {isOwnProfile ? 'Your Channels' : 'Channels'}
              <span className="text-neutral-500 font-mono ml-1">({channels.length})</span>
            </h3>
            <p className="text-[10px] text-neutral-500 uppercase tracking-tight">
              {isOwnProfile ? 'Manage your active memberships' : 'View shared and public channels'}
            </p>
          </div>
          <span className="text-[10px] text-violet-400 font-bold bg-violet-600/10 px-3 py-1 border border-violet-500/20 rounded-full uppercase tracking-widest">
            {isOwnProfile ? 'Active' : 'Memberships'}
          </span>
        </div>

        {channels.length === 0 ? (
          <div className="bg-neutral-900/20 border border-neutral-900/50 p-12 rounded-2xl text-center space-y-3">
            <div className="w-16 h-16 bg-neutral-900/40 rounded-full flex items-center justify-center mx-auto mb-2 border border-neutral-800/50">
              <MessageSquare className="text-neutral-600 w-8 h-8" />
            </div>
            <h4 className="text-neutral-300 font-semibold text-base">No channels found</h4>
            <p className="text-xs text-neutral-500 max-w-xs mx-auto leading-relaxed">
              {isOwnProfile 
                ? "You don't belong to any channels yet. Join a public channel or create a new one to get started!" 
                : "This user doesn't belong to any public channels yet."}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {channels.map((channel) => {
              return (
                <div
                  key={channel.channelId}
                  onClick={() => onSelectChannel(channel.channelId)}
                  className="bg-neutral-950/40 border border-neutral-900/60 p-5 rounded-2xl flex items-center gap-4 relative transition-all group shadow-sm hover:shadow-xl hover:border-violet-500/30 cursor-pointer hover:-translate-y-1 duration-300"
                  title={`Go to ${channel.title || 'Channel'}`}
                >
                  <Avatar name={channel.title || 'Channel'} className="w-12 h-12 text-sm shadow-lg group-hover:scale-105 transition-transform" />
                  
                  <div className="flex-1 min-w-0 pr-1">
                    <p className="font-bold text-neutral-100 text-[15px] truncate group-hover:text-violet-400 transition-colors mb-1.5">
                      {channel.title || 'Unnamed Channel'}
                    </p>
                    
                    {/* Role Badge */}
                    <div className="flex items-center">
                      <span
                        className={cn(
                          "text-[9px] font-black uppercase px-2 py-0.5 rounded-md tracking-widest flex items-center gap-1.5",
                          channel.role === 'ADMIN'
                            ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            : channel.role === 'PUBLISHER'
                            ? "bg-violet-500/10 text-violet-400 border border-violet-500/20"
                            : "bg-neutral-900/50 text-neutral-500 border border-neutral-800"
                        )}
                      >
                        {channel.role === 'ADMIN' && <ShieldAlert size={10} />}
                        {channel.role === 'PUBLISHER' && <ShieldCheck size={10} />}
                        {channel.role}
                      </span>
                    </div>
                  </div>

                  <div className="text-neutral-700 group-hover:text-violet-400 transition-colors shrink-0">
                    <ArrowRight size={18} className="transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
