import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import { type RootState } from '@/app/providers/store';
import { Sidebar } from '@/widgets/sidebar';
import { NotificationWindow } from '@/widgets/notification-window';
import { PageRoutes } from '@/shared/config';

export const ChannelPage = () => {
  const currentUserId = useSelector((state: RootState) => state.user.currentUserId);
  const { channelId } = useParams<{ channelId: string }>();
  const navigate = useNavigate();

  if (!currentUserId) {
    return null;
  }

  const handleSelectContact = (id: string) => {
    navigate(`${PageRoutes.channelBase}/${id}`);
  };

  return (
    <div className="flex h-screen bg-neutral-950 text-white overflow-hidden w-full">
      <Sidebar
        selectedChannelId={channelId || null}
        onSelectChannel={handleSelectContact}
        className={channelId ? 'hidden md:flex' : 'flex'}
      />

      {channelId ? (
        <div className="flex-1 h-full w-full">
          <NotificationWindow key={channelId} userId={currentUserId} channelId={channelId} isActive={true} />
        </div>
      ) : (
        <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-neutral-950 text-neutral-500 gap-3 border-l border-neutral-900/30">
          <div className="w-16 h-16 rounded-2xl bg-violet-600/5 text-violet-500 flex items-center justify-center border border-violet-500/10 shadow-inner">
            <MessageSquare size={32} />
          </div>
          <div className="text-center space-y-1">
            <h3 className="text-white text-sm font-semibold">Select a Channel</h3>
            <p className="text-xs text-neutral-500 max-w-xs leading-normal">
              Choose a subscription channel from the sidebar to view broadcast history and manage subscribers.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
