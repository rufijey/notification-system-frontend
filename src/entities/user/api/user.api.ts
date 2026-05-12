import { baseApi } from '@/shared/api/base';
import { ApiRoutes } from '@/shared/config';

export const userApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    updateProfile: build.mutation<{ username: string; fullName: string }, { fullName: string }>({
      query: (body) => ({
        url: ApiRoutes.users.updateProfile,
        method: 'PATCH',
        body,
      }),
    }),
  }),
});

export const { useUpdateProfileMutation } = userApi;
export default userApi;
