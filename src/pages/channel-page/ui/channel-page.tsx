import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
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
    <div className="flex h-screen bg-neutral-950 text-white overflow-hidden">
      <Sidebar
        selectedChannelId={channelId || null}
        onSelectChannel={handleSelectContact}
      />

      {channelId ? (
        <NotificationWindow key={channelId} userId={currentUserId} channelId={channelId} isActive={true} />
      ) : (
        <></>
      )}
    </div>
  );
};
