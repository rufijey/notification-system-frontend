import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/app/providers/store';
import { cryptoService } from '@/shared/lib/crypto-service';
import { userApi } from '@/entities/user/api/user.api';

export const CryptoInitializer = () => {
  const { currentUserId, isAuth } = useSelector((state: RootState) => state.user);
  const { data: profile } = userApi.useGetProfileQuery(currentUserId || '', { skip: !currentUserId });
  const [updateProfile] = userApi.useUpdateProfileMutation();

  useEffect(() => {
    if (isAuth && currentUserId) {
      cryptoService.init(currentUserId).then((pubKey) => {
        // If profile loaded and public key is missing or different, upload it
        if (profile && profile.publicKey !== pubKey) {
          updateProfile({ publicKey: pubKey });
        }
      });
    }
  }, [isAuth, currentUserId, profile, updateProfile]);

  return null;
};
