import { Socket } from 'socket.io-client';
import { SocketEvent } from '../model/constants';

export const initActivityTracking = (socket: Socket) => {
  const updateActivity = () => {
    const isActive = document.visibilityState === 'visible' && document.hasFocus();
    socket.emit(SocketEvent.UPDATE_ACTIVITY, { isActive });
  };

  window.addEventListener('visibilitychange', updateActivity);
  window.addEventListener('focus', updateActivity);
  window.addEventListener('blur', updateActivity);

  updateActivity();

  return () => {
    window.removeEventListener('visibilitychange', updateActivity);
    window.removeEventListener('focus', updateActivity);
    window.removeEventListener('blur', updateActivity);
  };
};
