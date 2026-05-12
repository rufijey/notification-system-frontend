import { cn } from '../../shared/lib/utils';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  center?: boolean;
}

export const Loader = ({ size = 'md', className, center = false }: LoaderProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-6 w-6 border-2',
    lg: 'h-12 w-12 border-[3px]',
  };

  const spinner = (
    <div
      className={cn(
        'animate-spin rounded-full border-violet-500 border-r-transparent border-l-transparent',
        sizeClasses[size],
        className
      )}
    />
  );

  if (center) {
    return (
      <div className="flex items-center justify-center h-full w-full p-4">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export const TopProgressBar = ({ active }: { active: boolean }) => {
  if (!active) return null;

  return (
    <div className="fixed top-0 left-0 right-0 h-[3px] bg-neutral-950/20 z-[99999] overflow-hidden pointer-events-none">
      <div className="h-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-indigo-600 w-full animate-loading-bar origin-left" />
    </div>
  );
};

interface FullScreenLoaderProps {
  active: boolean;
  text?: string;
}

export const FullScreenLoader = ({ active, text }: FullScreenLoaderProps) => {
  if (!active) return null;

  return (
    <div className="fixed inset-0 bg-neutral-950/70 backdrop-blur-md z-[99998] flex flex-col items-center justify-center gap-4 animate-in fade-in duration-300">
      <div className="p-4 bg-neutral-900/50 border border-neutral-800 rounded-2xl shadow-2xl flex flex-col items-center gap-3.5 max-w-xs w-full">
        <Loader size="lg" />
        {text && <p className="text-xs font-semibold text-neutral-300 tracking-wide">{text}</p>}
      </div>
    </div>
  );
};
