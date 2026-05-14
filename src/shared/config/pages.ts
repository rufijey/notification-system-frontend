/**
 * Frontend Page/Route Paths
 */
export const PageRoutes = {
  login: '/login',
  register: '/register',
  channelDetails: '/channel/:channelId',
  channelMembers: '/channel/:channelId/members',
  channelBase: '/channel',
  createChannel: '/create-channel',
  globalNotifications: '/global-notifications',
  profile: '/profile',
  adminDashboard: '/admin',
} as const;
