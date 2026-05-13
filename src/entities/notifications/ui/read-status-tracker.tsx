import { useEffect, useRef } from 'react';
import { useMarkAsReadMutation } from '../api';

interface ReadStatusTrackerProps {
  id: string;
  userId: string;
  status: string;
  isMe: boolean;
  isChannelActive?: boolean;
  children: React.ReactNode;
}

export const ReadStatusTracker = ({
  id,
  userId,
  status,
  isMe,
  isChannelActive = true,
  children
}: ReadStatusTrackerProps) => {
  const [markAsRead] = useMarkAsReadMutation();
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isMe || status === 'READ' || !isChannelActive) return;

    const tryMarkAsRead = () => {
      const isVisible = document.visibilityState === 'visible';
      if (isVisible && isChannelActive) {
        markAsRead({ userId, notificationId: id });
        return true;
      }
      return false;
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (tryMarkAsRead()) {
            observer.disconnect();
          } else {
            const handleActive = () => {
              if (tryMarkAsRead()) {
                window.removeEventListener('focus', handleActive);
                document.removeEventListener('visibilitychange', handleActive);
                observer.disconnect();
              }
            };
            window.addEventListener('focus', handleActive);
            document.addEventListener('visibilitychange', handleActive);
          }
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [id, userId, status, isMe, markAsRead, isChannelActive]);

  return <div ref={elementRef}>{children}</div>;
};
