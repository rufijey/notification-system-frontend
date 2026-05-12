import { baseApi } from '@/shared/api/base';

export const updateMatchingHistoryQueries = (
  state: any,
  dispatch: any,
  channelId: string,
  userId: string,
  query: string | undefined,
  updateFn: (draft: any) => void
) => {
  const queries = state[baseApi.reducerPath]?.queries || {};

  Object.keys(queries).forEach((key) => {
    if (key.startsWith('getHistory(')) {
      try {
        const argStr = key.substring(11, key.length - 1);
        const args = JSON.parse(argStr);

        const isUserMatch = args.userId === userId;
        const isChannelMatch = args.channelId === channelId;
        const isQueryMatch = (args.query || '') === (query || '');

        if (isUserMatch && isChannelMatch && isQueryMatch) {
          dispatch(
            (baseApi.util as any).updateQueryData('getHistory', args, updateFn)
          );
        }
      } catch (e) {
        console.error('[cache-utils] Failed to parse query key', key, e);
      }
    }
  });
};
