import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { type RootState } from '@/app/providers/store';
import { Sidebar } from '@/widgets/sidebar';
import { Loader } from '@/shared';
import { PageRoutes } from '@/shared/config';
import { Users } from 'lucide-react';
import {
  useGetChannelDetailsQuery,
  useGetChannelMembersQuery,
  useGetChannelsQuery,
  useUpdateMemberRoleMutation,
  useRenameChannelMutation,
} from '@/entities/notifications/api';

// Decomposed Sub-components
import { MembersHeader } from './components/members-header';
import { ChannelShowcase } from './components/channel-showcase';
import { MemberCard } from './components/member-card';

export const ChannelMembersPage = () => {
  const { channelId } = useParams<{ channelId: string }>();
  const navigate = useNavigate();
  const currentUserId = useSelector((state: RootState) => state.user.currentUserId);

  // Queries
  const { data: channelDetails, isLoading: isDetailsLoading } = useGetChannelDetailsQuery(channelId || '', {
    skip: !channelId,
  });
  const { data: members = [], isLoading: isMembersLoading } = useGetChannelMembersQuery(channelId || '', {
    skip: !channelId,
  });
  const { data: channels = [] } = useGetChannelsQuery(currentUserId || '', {
    skip: !currentUserId,
  });

  // Mutations
  const [updateRole, { isLoading: isUpdatingRole }] = useUpdateMemberRoleMutation();
  const [renameChannel] = useRenameChannelMutation();

  if (!currentUserId || !channelId) {
    return null;
  }

  const activeChannel = channels.find((c) => c.channelId === channelId);
  const currentUserRole = activeChannel?.role; // 'ADMIN' | 'PUBLISHER' | 'SUBSCRIBER'
  const isAdmin = currentUserRole === 'ADMIN';

  const handleSelectContact = (id: string) => {
    navigate(`${PageRoutes.channelBase}/${id}`);
  };

  const handleBackToChat = () => {
    navigate(`${PageRoutes.channelBase}/${channelId}`);
  };

  const handleUpdateRole = async (targetUserId: string, newRole: 'ADMIN' | 'PUBLISHER' | 'SUBSCRIBER') => {
    try {
      await updateRole({ channelId, userId: targetUserId, role: newRole }).unwrap();
    } catch (err) {
      console.error('Failed to update member role:', err);
    }
  };

  const handleUpdateDetails = async (newTitle?: string, newPhotoUrl?: string) => {
    try {
      await renameChannel({ channelId, title: newTitle, photoUrl: newPhotoUrl }).unwrap();
    } catch (err) {
      console.error('Failed to update channel details:', err);
    }
  };

  const isPageLoading = isDetailsLoading || isMembersLoading;
  const channelTitle = channelDetails?.title || activeChannel?.title || 'Loading channel...';
  const channelPhotoUrl = channelDetails?.photoUrl || activeChannel?.photoUrl;

  return (
    <div className="flex h-screen bg-neutral-950 text-white overflow-hidden w-full">
      {/* Sidebar hidden on mobile */}
      <Sidebar
        selectedChannelId={channelId}
        onSelectChannel={handleSelectContact}
        className="hidden md:flex"
      />

      {/* Main Members Dashboard Container */}
      <div className="flex-1 h-full flex flex-col bg-neutral-950 overflow-hidden relative border-l border-neutral-900/30">
        
        {/* Header (decomposed) */}
        <MembersHeader onBack={handleBackToChat} />

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 max-w-5xl w-full mx-auto">
          {isPageLoading ? (
            <div className="h-64 flex items-center justify-center">
              <Loader size="lg" />
            </div>
          ) : (
            <>
              {/* Channel Profile Showcase (decomposed) */}
              <ChannelShowcase
                channelTitle={channelTitle}
                channelId={channelId}
                photoUrl={channelPhotoUrl}
                memberCount={members.length}
                isAdmin={isAdmin}
                onUpdateDetails={handleUpdateDetails}
              />

              {/* Members List section */}
              <div className="mt-10 pt-10 border-t border-neutral-900/60">
                <div className="bg-neutral-950/30 rounded-3xl p-6 md:p-8 border border-neutral-900/40 shadow-inner space-y-6">
                  <div className="flex items-center justify-between border-b border-neutral-800/50 pb-4">
                    <div className="flex flex-col gap-1">
                      <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                        <Users size={16} className="text-emerald-500" />
                        Participants List
                        <span className="text-neutral-500 font-mono ml-1">({members.length})</span>
                      </h3>
                      <p className="text-[10px] text-neutral-500 uppercase tracking-tight">
                        {isAdmin ? 'Manage user roles and permissions' : 'View active members of this channel'}
                      </p>
                    </div>
                    {isAdmin && (
                      <span className="text-[10px] text-violet-400 font-bold bg-violet-600/10 px-3 py-1 border border-violet-500/20 rounded-full uppercase tracking-widest animate-pulse">
                        Admin panel active
                      </span>
                    )}
                  </div>

                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {members.map((member) => (
                      <MemberCard
                        key={member.userId}
                        member={member}
                        currentUserId={currentUserId}
                        isAdmin={isAdmin}
                        isUpdatingRole={isUpdatingRole}
                        onUpdateRole={handleUpdateRole}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
