import { Avatar } from '@/shared';
import { cn } from '@/shared/lib/utils';
import type { ChannelMember } from '../../../../entities/notifications/model/types';

interface MembersListProps {
  members: ChannelMember[];
  userId: string;
  channelId: string;
  role?: 'ADMIN' | 'PUBLISHER' | 'SUBSCRIBER';
  updateRole: (arg: { channelId: string; userId: string; role: 'ADMIN' | 'PUBLISHER' | 'SUBSCRIBER' }) => void;
}

export const MembersList = ({
  members,
  userId,
  channelId,
  role,
  updateRole,
}: MembersListProps) => {
  return (
    <div className="bg-neutral-900 border-b border-neutral-800 p-4 max-h-56 overflow-y-auto">
      <div className="text-[10px] text-neutral-500 uppercase tracking-widest mb-3 font-semibold">
        Participants ({members.length})
      </div>
      <div className="grid grid-cols-2 gap-3">
        {members.map((m) => (
          <div
            key={m.userId}
            className="flex items-center gap-3 text-sm text-white bg-neutral-950/50 p-3 rounded-xl border border-neutral-800/50 group"
          >
            <Avatar name={m.fullName || m.username} className="w-10 h-10 text-sm" />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-neutral-200 truncate flex items-center gap-2">
                {m.fullName}
                {m.userId === userId && (
                  <span className="text-[10px] text-blue-400 font-bold uppercase tracking-tighter">You</span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span
                  className={cn(
                    "text-[9px] font-black uppercase px-1.5 py-0.5 rounded tracking-wider",
                    m.role === 'ADMIN'
                      ? "bg-red-500/20 text-red-500 border border-red-500/30"
                      : m.role === 'PUBLISHER'
                      ? "bg-blue-500/20 text-blue-500 border border-blue-500/30"
                      : "bg-neutral-800 text-neutral-500 border border-neutral-700/50"
                  )}
                >
                  {m.role}
                </span>
                <span className="text-[10px] text-neutral-600 truncate">@{m.username}</span>
              </div>
            </div>
            {role === 'ADMIN' && m.role === 'SUBSCRIBER' && (
              <button
                onClick={() => updateRole({ channelId, userId: m.userId, role: 'PUBLISHER' })}
                className="opacity-0 group-hover:opacity-100 transition-opacity bg-blue-600 hover:bg-blue-500 text-[10px] text-white font-bold px-2 py-1 rounded"
                title="Promote to Publisher"
              >
                Promote
              </button>
            )}
            {role === 'ADMIN' && m.role === 'PUBLISHER' && (
              <button
                onClick={() => updateRole({ channelId, userId: m.userId, role: 'SUBSCRIBER' })}
                className="opacity-0 group-hover:opacity-100 transition-opacity bg-amber-600 hover:bg-amber-500 text-[10px] text-white font-bold px-2 py-1 rounded"
                title="Demote to Subscriber"
              >
                Demote
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
