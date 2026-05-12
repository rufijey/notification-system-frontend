import { useState } from 'react';
import { Copy, Check, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Avatar } from '@/shared';
import { PageRoutes } from '@/shared/config';
import { LogoutButton } from '@/features/auth/logout';
import { requestNotificationPermission } from '@/shared/lib/browser/notifications';

interface ProfileHeaderProps {
  currentUserId: string;
  fullName: string | null;
}

export const ProfileHeader = ({ currentUserId, fullName }: ProfileHeaderProps) => {
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(currentUserId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-[72px] px-4 border-b border-neutral-900/40 bg-neutral-900 flex items-center justify-between shrink-0">
      <div
        onClick={() => navigate(PageRoutes.profile)}
        className="flex items-center gap-3 overflow-hidden min-w-0 cursor-pointer hover:opacity-85 transition-opacity"
        title="View Profile Settings"
      >
        <Avatar name={fullName || currentUserId} />
        <div className="min-w-0 flex flex-col">
          <span className="font-semibold text-sm text-white truncate leading-tight">
            {fullName || currentUserId}
          </span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-white transition-colors group w-fit"
            title="Click to copy username"
          >
            {copied ? (
              <Check size={10} className="text-emerald-500 shrink-0" />
            ) : (
              <Copy size={10} className="shrink-0 group-hover:text-neutral-300" />
            )}
            <span className="truncate">@{currentUserId}</span>
          </button>
        </div>
      </div>
      <div className="flex items-center gap-1">
        {typeof window !== 'undefined' && 'Notification' in window && Notification.permission !== 'granted' && (
          <button
            onClick={() => requestNotificationPermission()}
            className="p-2 text-neutral-400 hover:text-sky-400 transition-colors"
            title="Enable notifications"
          >
            <Bell size={18} />
          </button>
        )}
        <LogoutButton />
      </div>
    </div>
  );
};
