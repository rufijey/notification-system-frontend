export interface Notification {
  id: string;
  channelId: string;
  senderId: string;
  text: string;
  sequence: number;
  status: string;
  createdAt: string;
  clientNotificationId?: string;
  isSending?: boolean;
  priority?: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
  parentNotificationId?: string;
  attachments?: string[];
}
export interface Channel {
  channelId: string;
  role?: 'ADMIN' | 'PUBLISHER' | 'SUBSCRIBER';
  title?: string;
  photoUrl?: string;
  lastNotification?: string;
  lastNotificationSenderId?: string;
  lastNotificationStatus?: string;
  lastNotificationSequence?: number;
  lastActivity: string;


  unreadCount: number;
  lastReadSequence: number;
  othersLastReadSequence: number;
  memberIds?: string[];
}

export interface ChannelMember {
  userId: string;
  username: string;
  fullName: string;
  avatarUrl?: string;
  role: 'ADMIN' | 'PUBLISHER' | 'SUBSCRIBER';
  lastReadSequence: number;
  joinedAt: string;
}

export interface NotificationCursor {
  channelId: string;
  lastKnownSequence: number;
}
