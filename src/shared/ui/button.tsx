import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '../lib/utils';

export const Button = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-neutral-800 focus:outline-none disabled:pointer-events-none disabled:opacity-50 bg-neutral-900 text-white',
          className
        )}
        {...props}
      />
    );
  }
);
