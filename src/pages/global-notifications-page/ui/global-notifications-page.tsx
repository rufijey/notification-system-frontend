import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { type RootState } from '@/app/providers/store';
import { Sidebar } from '@/widgets/sidebar';
import { GlobalNotifications } from '@/widgets/global-notifications';
import { PageRoutes } from '@/shared/config';

export const GlobalNotificationsPage = () => {
  const currentUserId = useSelector((state: RootState) => state.user.currentUserId);
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
        selectedChannelId={null}
        onSelectChannel={handleSelectContact}
      />

      <GlobalNotifications
        onNavigateToChannel={handleSelectContact}
      />
    </div>
  );
};
