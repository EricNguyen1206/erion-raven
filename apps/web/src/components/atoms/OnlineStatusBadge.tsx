/**
 * OnlineStatusBadge
 * 
 * A small badge indicator showing online/offline status for a user.
 * Green = online, Gray = offline.
 */

import { cn } from '@/lib/utils';
import { useOnlineStatusStore } from '@/store/useOnlineStatusStore';

type OnlineStatusBadgeProps = {
  userId: string;
  size?: 'sm' | 'md';
  className?: string;
};

const OnlineStatusBadge = ({ userId, size = 'sm', className }: OnlineStatusBadgeProps) => {
  const statuses = useOnlineStatusStore((state) => state.statuses);
  const isOnline = statuses[userId] ?? false;

  return (
    <span
      className={cn(
        'absolute bottom-0 right-0 rounded-full border-2 border-background transition-colors duration-200',
        isOnline ? 'bg-green-500' : 'bg-gray-400',
        size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3',
        className
      )}
      aria-label={isOnline ? 'Online' : 'Offline'}
    />
  );
};

export default OnlineStatusBadge;
