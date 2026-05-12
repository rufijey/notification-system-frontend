import { Socket } from 'socket.io-client';

interface CacheBinderParams {
  socket: Socket;
  listeners: Record<string, (...args: any[]) => void>;
  cacheDataLoaded: Promise<any>;
  cacheEntryRemoved: Promise<any>;
  onCleanup?: () => void;
}

export const bindSocketToCache = async ({
  socket,
  listeners,
  cacheDataLoaded,
  cacheEntryRemoved,
  onCleanup
}: CacheBinderParams) => {
  try {
    await cacheDataLoaded;
    // Bind listeners
    Object.entries(listeners).forEach(([event, listener]) => {
      socket.on(event, listener);
    });
  } catch { }

  await cacheEntryRemoved;

  // Unbind listeners
  Object.entries(listeners).forEach(([event, listener]) => {
    socket.off(event, listener);
  });

  if (onCleanup) {
    onCleanup();
  }
};
