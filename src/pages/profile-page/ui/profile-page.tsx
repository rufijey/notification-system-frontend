import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { type RootState } from '@/app/providers/store';
import { Sidebar } from '@/widgets/sidebar';
import { Loader } from '@/shared';
import { PageRoutes } from '@/shared/config';
import { setFullName, setAvatarUrl, useGetProfileQuery } from '@/entities/user';
import { useUpdateProfileMutation } from '@/entities/user';
import { useGetChannelsQuery } from '@/entities/notifications/api';

// Decomposed Subcomponents
import { ProfileHeader } from './components/profile-header';
import { ProfileInfoCard } from './components/profile-info-card';
import { ProfileChannelList } from './components/profile-channel-list';

export const ProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { username: routeUsername } = useParams<{ username: string }>();
  const { currentUserId, fullName: myFullName, avatarUrl: myAvatarUrl, accessToken } = useSelector((state: RootState) => state.user);

  const isOwnProfile = !routeUsername || routeUsername === currentUserId;
  const targetUsername = routeUsername || currentUserId || '';

  // Fetch target profile if not own
  const { data: targetProfile, isLoading: isProfileLoading } = useGetProfileQuery(targetUsername, {
    skip: isOwnProfile || !targetUsername,
  });

  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const { data: channels = [], isLoading: isChannelsLoading } = useGetChannelsQuery(targetUsername, {
    skip: !targetUsername,
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
    if (!isOwnProfile) return;
    try {
      await updateProfile({ fullName: newFullName }).unwrap();
      dispatch(setFullName(newFullName));
    } catch (err) {
      console.error('Failed to update profile name:', err);
    }
  };

  const handleUpdateAvatar = async (newAvatarUrl: string) => {
    if (!isOwnProfile) return;
    try {
      await updateProfile({ avatarUrl: newAvatarUrl }).unwrap();
      dispatch(setAvatarUrl(newAvatarUrl));
    } catch (err) {
      console.error('Failed to update profile avatar:', err);
    }
  };

  const isPageLoading = isChannelsLoading || isUpdating || isProfileLoading;
  
  const displayFullName = isOwnProfile ? myFullName : (targetProfile?.fullName || null);
  const displayAvatarUrl = isOwnProfile ? myAvatarUrl : (targetProfile?.avatarUrl || null);

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
        <ProfileHeader 
          onBack={handleBackToChats} 
          title={isOwnProfile ? "Your Profile" : `${targetUsername}'s Profile`}
          subtitle={isOwnProfile 
            ? "Manage your credentials, update your full name, and view your active channels list" 
            : `View ${targetUsername}'s profile and their shared channels`}
        />

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
                currentUserId={currentUserId || ''}
                username={targetUsername}
                fullName={displayFullName}
                avatarUrl={displayAvatarUrl}
                accessToken={accessToken}
                onUpdateFullName={handleUpdateFullName}
                onUpdateAvatar={handleUpdateAvatar}
                isOwnProfile={isOwnProfile}
              />

              {/* Channels List (decomposed) */}
              <ProfileChannelList
                channels={channels}
                onSelectChannel={handleSelectChannel}
                isOwnProfile={isOwnProfile}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};
