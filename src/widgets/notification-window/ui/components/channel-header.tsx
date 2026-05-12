import { useState } from 'react';
import { ChevronDown, Copy, Check, UserPlus, Users, LogOut, Search, X } from 'lucide-react';
import { Avatar } from '@/shared';

interface ChannelHeaderProps {
  title: string;
  channelId: string;
  showStatus: boolean;
  memberCount: number;
  role?: 'ADMIN' | 'PUBLISHER' | 'SUBSCRIBER';
  showMembers: boolean;
  setShowMembers: (show: boolean) => void;
  onInviteClick: () => void;
  onLeaveClick: () => void;
  searchVal: string;
  setSearchVal: (val: string) => void;
  showSearch: boolean;
  setShowSearch: (val: boolean) => void;
}

export const ChannelHeader = ({
  title,
  channelId,
  showStatus,
  memberCount,
  role,
  showMembers,
  setShowMembers,
  onInviteClick,
  onLeaveClick,
  searchVal,
  setSearchVal,
  showSearch,
  setShowSearch,
}: ChannelHeaderProps) => {
  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(channelId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-[72px] px-4 border-b border-neutral-800 flex items-center gap-3 bg-neutral-900 shrink-0">
      {showSearch ? (
        <div className="flex-1 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
            <input
              type="text"
              placeholder="Search messages in this channel..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="pl-9 pr-8 py-1.5 w-full bg-neutral-950 border border-neutral-800 text-xs text-white placeholder-neutral-500 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500/50"
              autoFocus
            />
            {searchVal && (
              <button
                onClick={() => setSearchVal('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <button
            onClick={() => {
              setShowSearch(false);
              setSearchVal('');
            }}
            className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-850 transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      ) : (
        <>
          <Avatar name={title} />
          <div className="flex-1 min-w-0">
            <div className="font-bold text-white truncate flex items-center gap-2">
              {title}
              <span
                className="text-xs font-normal text-neutral-400 bg-neutral-800 px-1.5 py-0.5 rounded cursor-pointer hover:bg-neutral-700 flex items-center gap-1"
                onClick={handleCopy}
                title="Click to copy Channel ID"
              >
                {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                #{channelId}
              </span>
            </div>
            {showStatus ? (
              <div className="flex items-center gap-2">
                <div className="text-xs text-green-500">{memberCount} members</div>
              </div>
            ) : (
              <div className="text-xs text-neutral-600">Loading status...</div>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowSearch(true)}
              className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-full transition-colors cursor-pointer"
              title="Search messages"
            >
              <Search size={18} />
            </button>

            {role && (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-full transition-colors cursor-pointer"
                >
                  <ChevronDown size={18} />
                </button>
                {showMenu && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-neutral-800 border border-neutral-700 rounded-lg shadow-xl overflow-hidden z-10">
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onInviteClick();
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-white hover:bg-neutral-700 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <UserPlus size={14} /> Invite User
                    </button>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        setShowMembers(!showMembers);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-white hover:bg-neutral-700 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Users size={14} /> {showMembers ? 'Hide Members' : 'View Members'}
                    </button>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onLeaveClick();
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-neutral-700 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <LogOut size={14} /> Unsubscribe
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
