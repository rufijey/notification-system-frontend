import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { type RootState } from '@/app/providers/store';
import { Sidebar } from '@/widgets/sidebar';
import { Loader } from '@/shared';
import { PageRoutes } from '@/shared/config';
import { setFullName } from '@/entities/user';
import { useUpdateProfileMutation } from '@/entities/user';
import { useGetChannelsQuery } from '@/entities/notifications/api';

// Decomposed Subcomponents
import { ProfileHeader } from './components/profile-header';
import { ProfileInfoCard } from './components/profile-info-card';
import { ProfileChannelList } from './components/profile-channel-list';

export const ProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentUserId, fullName } = useSelector((state: RootState) => state.user);

  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const { data: channels = [], isLoading: isChannelsLoading } = useGetChannelsQuery(currentUserId || '', {
    skip: !currentUserId,
  });

  if (!currentUserId) {
    return null;
  }

  const handleSelectChannel = (channelId: string) => {
    navigate(`${PageRoutes.channelBase}/${channelId}`);
  };

  const handleBackToChats = () => {
    navigate(PageRoutes.channelBase);
  };

  const handleUpdateFullName = async (newFullName: string) => {
    try {
      await updateProfile({ fullName: newFullName }).unwrap();
      dispatch(setFullName(newFullName));
    } catch (err) {
      console.error('Failed to update profile name:', err);
    }
  };

  const isPageLoading = isChannelsLoading || isUpdating;

  return (
    <div className="flex h-screen bg-neutral-950 text-white overflow-hidden w-full">
      {/* Sidebar hidden on mobile */}
      <Sidebar
        selectedChannelId={null}
        onSelectChannel={handleSelectChannel}
        className="hidden md:flex"
      />

      {/* Main Profile Dashboard Container */}
      <div className="flex-1 h-full flex flex-col bg-neutral-950 overflow-hidden relative border-l border-neutral-900/30">
        
        {/* Header (decomposed) */}
        <ProfileHeader onBack={handleBackToChats} />

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 max-w-5xl w-full mx-auto">
          {isPageLoading && channels.length === 0 ? (
            <div className="h-64 flex items-center justify-center">
              <Loader size="lg" />
            </div>
          ) : (
            <>
              {/* Profile Details Showcase (decomposed) */}
              <ProfileInfoCard
                currentUserId={currentUserId}
                fullName={fullName}
                onUpdateFullName={handleUpdateFullName}
              />

              {/* Channels List (decomposed) */}
              <ProfileChannelList
                channels={channels}
                onSelectChannel={handleSelectChannel}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};
