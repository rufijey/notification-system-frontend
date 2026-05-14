import { notificationsApi } from '../api';
import type { AppDispatch } from '@/app/providers/store';
import type { Notification } from '../model/types';

export interface OfflineMessage {
  senderId: string;
  channelId: string;
  notification: string;
  clientNotificationId: string;
  priority?: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
  parentNotificationId?: string;
  attachments?: string[];
}

const QUEUE_KEY = 'offline_notifications_queue';

export const getOfflineQueue = (): OfflineMessage[] => {
  try {
    const data = localStorage.getItem(QUEUE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveOfflineQueue = (queue: OfflineMessage[]) => {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch (err) {
    console.error('Failed to save offline queue', err);
  }
};

export const addToOfflineQueue = (message: OfflineMessage) => {
  const queue = getOfflineQueue();
  if (queue.some((x) => x.clientNotificationId === message.clientNotificationId)) {
    return;
  }
  queue.push(message);
  saveOfflineQueue(queue);
};

export const removeFromOfflineQueue = (clientNotificationId: string) => {
  const queue = getOfflineQueue();
  const filtered = queue.filter((x) => x.clientNotificationId !== clientNotificationId);
  saveOfflineQueue(filtered);
};

export interface MinimalState {
  api?: {
    queries?: Record<string, unknown>;
  };
}

export const updateHistoryCacheForChannel = (
  dispatch: AppDispatch,
  getState: () => MinimalState,
  userId: string,
  channelId: string,
  updateFn: (draft: { items: Notification[]; hasMore: boolean }) => void
) => {
  const state = getState();
  const queries = state.api?.queries || {};
  
  Object.keys(queries).forEach((key) => {
    if (key.startsWith('getHistory(')) {
      try {
        const argStr = key.substring(11, key.length - 1);
        const args = JSON.parse(argStr);
        
        if (args.userId === userId && args.channelId === channelId) {
          dispatch(
            notificationsApi.util.updateQueryData(
              'getHistory',
              args as { userId: string; channelId: string; limit?: number; query?: string },
              updateFn
            )
          );
        }
      } catch (e) {
        console.error('Failed to parse query key', key, e);
      }
    }
  });
};

let isProcessingQueue = false;
let retryCount = 0;
let backoffTimeout: ReturnType<typeof setTimeout> | null = null;

export const processOfflineQueue = async (dispatch: AppDispatch, getState: () => MinimalState) => {
  if (isProcessingQueue) return;
  const queue = getOfflineQueue();
  if (queue.length === 0) {
    retryCount = 0;
    if (backoffTimeout) {
      clearTimeout(backoffTimeout);
      backoffTimeout = null;
    }
    return;
  }

  isProcessingQueue = true;
  if (backoffTimeout) {
    clearTimeout(backoffTimeout);
    backoffTimeout = null;
  }

  console.log(`[Offline Queue] Processing ${queue.length} items (Attempt ${retryCount + 1})...`);

  for (const msg of queue) {
    try {
      // Set the item back to sending / PENDING status before initiating
      updateHistoryCacheForChannel(dispatch, getState, msg.senderId, msg.channelId, (draft) => {
        if (!draft || !draft.items) return;
        const item = draft.items.find((x) => x.clientNotificationId === msg.clientNotificationId);
        if (item) {
          item.isSending = true;
          item.status = 'PENDING';
        }
      });

      // Initiate the mutation manually via Redux dispatch
      await dispatch(
        notificationsApi.endpoints.sendNotification.initiate({
          senderId: msg.senderId,
          channelId: msg.channelId,
          notification: msg.notification,
          clientNotificationId: msg.clientNotificationId,
          priority: msg.priority,
          parentNotificationId: msg.parentNotificationId,
          attachments: msg.attachments,
        })
      ).unwrap();

      // Successful send, safe to remove
      removeFromOfflineQueue(msg.clientNotificationId);
      retryCount = 0; // Reset backoff on success
    } catch (error) {
      console.error(`[Offline Queue] Failed to send queued message ${msg.clientNotificationId}:`, error);

      // Restore failed offline status
      updateHistoryCacheForChannel(dispatch, getState, msg.senderId, msg.channelId, (draft) => {
        if (!draft || !draft.items) return;
        const item = draft.items.find((x) => x.clientNotificationId === msg.clientNotificationId);
        if (item) {
          item.isSending = false;
          item.status = 'FAILED_OFFLINE';
        }
      });

      retryCount += 1;
      const delay = Math.min(1000 * Math.pow(2, retryCount), 30000);
      console.log(`[Offline Queue] Network unstable. Scheduling backoff retry in ${delay / 1000}s...`);

      backoffTimeout = setTimeout(() => {
        processOfflineQueue(dispatch, getState);
      }, delay);

      // Break immediately on any failure to preserve strict message order in threads
      break;
    }
  }

  isProcessingQueue = false;
};
