export enum SocketEvent {
  RECEIVE_NOTIFICATION = 'receive_notification',
  NOTIFICATION_DELIVERED = 'notification_delivered',
  NOTIFICATION_READ = 'notification_read',
  CHANNEL_READ = 'channel_read',
  USER_STATUS = 'user_status',
  UPDATE_ACTIVITY = 'update_activity',
  ACK = 'ack',
  READ = 'read',
  SYNC_NOTIFICATIONS = 'sync_notifications',
  CHANNEL_JOINED = 'channel_joined',
  CHANNEL_UPDATED = 'channel_updated',
}

export enum UserStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
}
