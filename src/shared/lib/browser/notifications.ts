export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) return 'denied';
  if (Notification.permission === 'default') {
    return await Notification.requestPermission();
  }
  return Notification.permission;
};

export const showSystemNotification = (title: string, body: string, notificationId?: string) => {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;

  const tag = notificationId || 'new-notification';

  const notification = new Notification(title, {
    body,
    icon: '/favicon.svg',
    tag: tag,
  });

  notification.onshow = () => {
    setTimeout(() => notification.close(), 1500);
  };

  notification.onclick = () => {
    window.focus();
    notification.close();
  };
};
