import { cn } from '../lib/utils';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  isOnline?: boolean;
}

export const Avatar = ({ name, size = 'md', className, isOnline }: AvatarProps) => {
  const firstLetter = name[0]?.toUpperCase() || '?';
  
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  const dotSizeClasses = {
    sm: 'w-2.5 h-2.5 border-2',
    md: 'w-3 h-3 border-2',
    lg: 'w-3.5 h-3.5 border-2',
  };

  // Простая генерация цвета на основе имени
  const colors = [
    'bg-blue-600',
    'bg-emerald-600',
    'bg-violet-600',
    'bg-amber-600',
    'bg-rose-600',
    'bg-indigo-600',
    'bg-cyan-600',
  ];
  
  const colorIndex = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  const bgColor = colors[colorIndex];

  return (
    <div className="relative shrink-0">
      <div
        className={cn(
          'rounded-full flex items-center justify-center font-bold text-white',
          sizeClasses[size],
          bgColor,
          className
        )}
      >
        {firstLetter}
      </div>
      {isOnline !== undefined && (
        <div
          className={cn(
            'absolute bottom-0 right-0 rounded-full border-neutral-900',
            dotSizeClasses[size],
            isOnline ? 'bg-green-500' : 'bg-neutral-500'
          )}
        />
      )}
    </div>
  );
};
