import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ShieldCheck } from 'lucide-react';
import { Avatar } from '@/shared';
import { cn } from '@/shared/lib/utils';
import { PageRoutes } from '@/shared/config';
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
  const navigate = useNavigate();
  const isSelf = member.userId === currentUserId;

  const handleProfileClick = () => {
    navigate(`${PageRoutes.profile}/${member.userId}`);
  };

  return (
    <div
      onClick={handleProfileClick}
      className={cn(
        "bg-neutral-950/40 border p-5 rounded-2xl flex items-center gap-4 relative transition-all group shadow-sm hover:shadow-xl cursor-pointer hover:-translate-y-1 duration-300",
        isSelf ? "border-violet-500/40 bg-violet-500/[0.03]" : "border-neutral-900/60"
      )}
    >
      <Avatar 
        name={member.fullName || member.username} 
        src={member.avatarUrl} 
        className="w-12 h-12 text-sm shadow-md group-hover:scale-105 transition-transform" 
      />
      
      <div className="flex-1 min-w-0 pr-1">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-bold text-neutral-100 text-[15px] truncate group-hover:text-violet-400 transition-colors">
            {member.fullName}
          </p>
          {isSelf && (
            <span className="text-[9px] bg-violet-600/20 text-violet-400 font-black uppercase px-2 py-0.5 rounded-md border border-violet-500/20 tracking-widest">
              You
            </span>
          )}
        </div>
        <p className="text-[11px] text-neutral-500 truncate font-mono">@{member.username}</p>
        
        {/* Role Badge */}
        <div className="mt-3 flex items-center">
          <span
            className={cn(
              "text-[9px] font-black uppercase px-2 py-0.5 rounded-md tracking-widest flex items-center gap-1.5",
              member.role === 'ADMIN'
                ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                : member.role === 'PUBLISHER'
                ? "bg-violet-500/10 text-violet-400 border border-violet-500/20"
                : "bg-neutral-900/50 text-neutral-500 border border-neutral-800"
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
        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-all duration-300 flex items-center gap-1 bg-neutral-900 p-1.5 border border-neutral-800 rounded-xl shadow-2xl z-20">
          {/* Promote / Demote Publisher */}
          {member.role === 'SUBSCRIBER' && (
            <button
              onClick={(e) => { e.stopPropagation(); onUpdateRole(member.userId, 'PUBLISHER'); }}
              disabled={isUpdatingRole}
              className="px-2.5 py-1 text-[10px] font-bold bg-violet-600 hover:bg-violet-500 rounded-lg cursor-pointer text-white shrink-0 shadow-lg shadow-violet-600/20 active:scale-95 transition-transform"
              title="Promote to Publisher"
            >
              Promote
            </button>
          )}
          {member.role === 'PUBLISHER' && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); onUpdateRole(member.userId, 'SUBSCRIBER'); }}
                disabled={isUpdatingRole}
                className="px-2.5 py-1 text-[10px] font-bold bg-neutral-700 hover:bg-neutral-600 rounded-lg cursor-pointer text-white shrink-0 active:scale-95 transition-transform"
                title="Demote to Subscriber"
              >
                Demote
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onUpdateRole(member.userId, 'ADMIN'); }}
                disabled={isUpdatingRole}
                className="p-1.5 text-rose-400 hover:text-white hover:bg-rose-500/20 rounded-lg cursor-pointer shrink-0 transition-colors"
                title="Make Admin"
              >
                <ShieldAlert size={14} />
              </button>
            </>
          )}
          {/* Demote Admin back to publisher */}
          {member.role === 'ADMIN' && (
            <button
              onClick={(e) => { e.stopPropagation(); onUpdateRole(member.userId, 'PUBLISHER'); }}
              disabled={isUpdatingRole}
              className="px-2.5 py-1 text-[10px] font-bold bg-rose-600 hover:bg-rose-500 rounded-lg cursor-pointer text-white shrink-0 shadow-lg shadow-rose-600/20 active:scale-95 transition-transform"
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
