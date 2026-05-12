/**
 * Backend API Endpoints (relative to base URL)
 */
export const ApiRoutes = {
  users: {
    login: '/users/login',
    register: '/users/register',
    logout: '/users/logout',
    refresh: '/users/refresh',
  },
  notifications: {
    history: (channelId: string) => `/notifications/history/${encodeURIComponent(channelId)}`,
    send: (userId: string) => `/notifications/send?userId=${userId}`,
    readAll: (channelId: string, userId: string) => `/notifications/read-all/${encodeURIComponent(channelId)}?userId=${userId}`,
    global: '/notifications/global',
  },
  channels: {
    list: (userId: string) => `/notifications/channels?userId=${userId}`,
    create: (userId: string) => `/notifications/channels?userId=${userId}`,
    join: (channelId: string, userId: string) => `/notifications/channels/${encodeURIComponent(channelId)}/join?userId=${userId}`,
    members: (channelId: string) => `/notifications/channels/${encodeURIComponent(channelId)}/members`,
    roleUpdate: (channelId: string, userId: string) => `/notifications/channels/${encodeURIComponent(channelId)}/members/${encodeURIComponent(userId)}/role`,
    search: (query: string) => `/notifications/channels/search?query=${encodeURIComponent(query)}`,
    details: (channelId: string) => `/notifications/channels/${encodeURIComponent(channelId)}`,
  },
} as const;
