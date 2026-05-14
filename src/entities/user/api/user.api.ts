import { baseApi } from '@/shared/api/base';
import { ApiRoutes } from '@/shared/config';
import { UserRole } from '../model/types';

export const userApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    updateProfile: build.mutation<{ username: string; fullName: string; avatarUrl?: string; publicKey?: string }, { fullName?: string; avatarUrl?: string; publicKey?: string }>({
      query: (body) => ({
        url: ApiRoutes.users.updateProfile,
        method: 'PATCH',
        body,
      }),
    }),
    getProfile: build.query<{ username: string; fullName: string | null; avatarUrl: string | null; role: UserRole; publicKey?: string }, string>({
      query: (username) => ({
        url: `${ApiRoutes.users.base}/${username}`,
        method: 'GET',
      }),
    }),
    getPublicKeys: build.query<Record<string, string>, string[]>({
      query: (usernames) => ({
        url: `${ApiRoutes.users.base}/public-keys`,
        method: 'POST',
        body: { usernames },
      }),
    }),
  }),
});

export const { useUpdateProfileMutation, useGetProfileQuery, useGetPublicKeysQuery } = userApi;
export default userApi;
