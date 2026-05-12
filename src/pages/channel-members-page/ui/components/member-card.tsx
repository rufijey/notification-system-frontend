import { ShieldAlert, ShieldCheck } from 'lucide-react';
import { Avatar } from '@/shared';
import { cn } from '@/shared/lib/utils';
import type { ChannelMember } from '@/entities/notifications/model/types';

interface MemberCardProps {
  member: ChannelMember;
  currentUserId: string;
  isAdmin: boolean;
  isUpdatingRole: boolean;
  onUpdateRole: (targetUserId: string, newRole: 'ADMIN' | 'PUBLISHER' | 'SUBSCRIBER') => void;
}

export const MemberCard = ({
  member,
  currentUserId,
  isAdmin,
  isUpdatingRole,
  onUpdateRole,
}: MemberCardProps) => {
  const isSelf = member.userId === currentUserId;

  return (
    <div
      className={cn(
        "bg-neutral-900/40 border p-4 rounded-xl flex items-center gap-3 relative transition-all group shadow-sm hover:shadow-md",
        isSelf ? "border-violet-500/30" : "border-neutral-900/40"
      )}
    >
      <Avatar name={member.fullName || member.username} className="w-10 h-10 text-sm" />
      
      <div className="flex-1 min-w-0 pr-1">
        <p className="font-semibold text-neutral-200 text-sm truncate flex items-center gap-1.5">
          {member.fullName}
          {isSelf && (
            <span className="text-[9px] bg-violet-600/20 text-violet-400 font-bold uppercase px-1.5 py-0.5 rounded-full border border-violet-500/20 tracking-wide">
              You
            </span>
          )}
        </p>
        <p className="text-[11px] text-neutral-500 truncate">@{member.username}</p>
        
        {/* Role Badge */}
        <div className="mt-2 flex items-center">
          <span
            className={cn(
              "text-[9px] font-black uppercase px-2 py-0.5 rounded-md tracking-wider flex items-center gap-1",
              member.role === 'ADMIN'
                ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                : member.role === 'PUBLISHER'
                ? "bg-violet-500/10 text-violet-400 border border-violet-500/20"
                : "bg-neutral-950 text-neutral-500 border border-neutral-900"
            )}
          >
            {member.role === 'ADMIN' && <ShieldAlert size={10} />}
            {member.role === 'PUBLISHER' && <ShieldCheck size={10} />}
            {member.role}
          </span>
        </div>
      </div>

      {/* Admin Action Menu Toggles */}
      {isAdmin && !isSelf && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-all duration-300 flex items-center gap-1 bg-neutral-900 p-1 border border-neutral-800 rounded-lg shadow-xl z-10">
          {/* Promote / Demote Publisher */}
          {member.role === 'SUBSCRIBER' && (
            <button
              onClick={() => onUpdateRole(member.userId, 'PUBLISHER')}
              disabled={isUpdatingRole}
              className="px-2 py-1 text-[10px] font-bold bg-violet-600 hover:bg-violet-500 rounded cursor-pointer text-white shrink-0"
              title="Promote to Publisher"
            >
              Promote
            </button>
          )}
          {member.role === 'PUBLISHER' && (
            <>
              <button
                onClick={() => onUpdateRole(member.userId, 'SUBSCRIBER')}
                disabled={isUpdatingRole}
                className="px-2 py-1 text-[10px] font-bold bg-amber-600 hover:bg-amber-500 rounded cursor-pointer text-white shrink-0"
                title="Demote to Subscriber"
              >
                Demote
              </button>
              <button
                onClick={() => onUpdateRole(member.userId, 'ADMIN')}
                disabled={isUpdatingRole}
                className="p-1 text-rose-400 hover:text-white hover:bg-rose-500/20 rounded cursor-pointer shrink-0"
                title="Make Admin"
              >
                <ShieldAlert size={14} />
              </button>
            </>
          )}
          {/* Demote Admin back to publisher */}
          {member.role === 'ADMIN' && (
            <button
              onClick={() => onUpdateRole(member.userId, 'PUBLISHER')}
              disabled={isUpdatingRole}
              className="px-2 py-1 text-[10px] font-bold bg-rose-600 hover:bg-rose-500 rounded cursor-pointer text-white shrink-0"
              title="Demote to Publisher"
            >
              Demote
            </button>
          )}
        </div>
      )}
    </div>
  );
};
