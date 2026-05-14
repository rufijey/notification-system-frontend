import { type ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/shared';
import { cn } from '@/shared/lib/utils';

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon: ReactNode;
  variant?: 'primary' | 'danger' | 'warning';
  children: ReactNode;
  actionLabel: string;
  onAction: () => void;
  isLoading?: boolean;
  isDisabled?: boolean;
  maxWidth?: string;
}

export const ActionModal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  variant = 'primary',
  children,
  actionLabel,
  onAction,
  isLoading,
  isDisabled,
  maxWidth = 'max-w-md'
}: ActionModalProps) => {

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const variantStyles = {
    primary: {
      iconBg: 'bg-violet-500/10',
      iconText: 'text-violet-500',
      button: 'bg-violet-600 hover:bg-violet-500 shadow-violet-600/20',
      shadow: 'shadow-violet-500/10'
    },
    danger: {
      iconBg: 'bg-rose-500/10',
      iconText: 'text-rose-500',
      button: 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20',
      shadow: 'shadow-rose-500/10'
    },
    warning: {
      iconBg: 'bg-amber-500/10',
      iconText: 'text-amber-500',
      button: 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/20',
      shadow: 'shadow-amber-500/10'
    }
  };

  const style = variantStyles[variant];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-neutral-950/80 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />

      <div className={cn(
        "relative w-full bg-neutral-900 border border-neutral-800 rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300",
        maxWidth,
        style.shadow
      )}>
        {/* Header */}
        <div className="p-6 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/50">
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-xl", style.iconBg, style.iconText)}>
              {icon}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white leading-none">{title}</h3>
              {subtitle && (
                <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-black mt-1">{subtitle}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-500 hover:text-white hover:bg-neutral-800 rounded-xl transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          {children}
        </div>

        {/* Footer */}
        <div className="p-6 bg-neutral-950/50 border-t border-neutral-800 flex gap-3">
          <Button
            onClick={onClose}
            className="flex-1 rounded-2xl border border-neutral-800 text-neutral-400 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={onAction}
            disabled={isDisabled || isLoading}
            className={cn(
              "flex-1 text-white rounded-2xl shadow-lg font-bold disabled:opacity-50 transition-all active:scale-[0.98]",
              style.button
            )}
          >
            {isLoading ? 'Processing...' : actionLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};
