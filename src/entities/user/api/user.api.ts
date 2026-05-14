import { baseApi } from '@/shared/api/base';
import { ApiRoutes } from '@/shared/config';
import { UserRole } from '../model/types';

export const userApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    updateProfile: build.mutation<{ username: string; fullName: string; avatarUrl?: string }, { fullName?: string; avatarUrl?: string }>({
      query: (body) => ({
        url: ApiRoutes.users.updateProfile,
        method: 'PATCH',
        body,
      }),
    }),
    getProfile: build.query<{ username: string; fullName: string | null; avatarUrl: string | null; role: UserRole }, string>({
      query: (username) => ({
        url: `${ApiRoutes.users.base}/${username}`,
        method: 'GET',
      }),
    }),
  }),
});

export const { useUpdateProfileMutation, useGetProfileQuery } = userApi;
export default userApi;
