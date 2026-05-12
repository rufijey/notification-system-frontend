import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { loginThunk } from '../../model/auth.thunks';
import type { AppDispatch } from '@/app/providers/store';
import { Button, Input } from '@/shared';
import { Link } from 'react-router-dom';
import { cn } from '@/shared/lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PageRoutes } from '@/shared/config';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required').min(6, 'Password must be at least 6 characters'),
});

type LoginFields = z.infer<typeof loginSchema>;

export const LoginForm = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmittingState, setIsSubmittingState] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFields>({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
  });

  const onSubmit = async (data: LoginFields) => {
    setSubmitError(null);
    setIsSubmittingState(true);
    try {
      const result = await dispatch(loginThunk(data));

      if (loginThunk.rejected.match(result)) {
        const message = result.payload as string || 'Authentication failed';
        if (message === 'Invalid credentials') {
          setSubmitError('Invalid email or password');
        } else {
          setSubmitError(message);
        }
      }
    } finally {
      setIsSubmittingState(false);
    }
  };

  const activeSubmitting = isSubmitting || isSubmittingState;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-neutral-300">Email</label>
        </div>
        <Input
          type="email"
          placeholder="name@example.com"
          {...register('email')}
          className={cn(
            "h-12 text-white transition-all bg-neutral-950 border-neutral-800",
            errors.email && "border-red-500/80 focus-visible:ring-red-500 bg-red-500/5"
          )}
          disabled={activeSubmitting}
        />
        {errors.email && (
          <p className="text-red-400 text-xs font-medium pl-1 animate-fade-in">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-neutral-300">Password</label>
        </div>
        <Input
          type="password"
          placeholder="••••••••"
          {...register('password')}
          className={cn(
            "h-12 text-white transition-all bg-neutral-950 border-neutral-800",
            errors.password && "border-red-500/80 focus-visible:ring-red-500 bg-red-500/5"
          )}
          disabled={activeSubmitting}
        />
        {errors.password && (
          <p className="text-red-400 text-xs font-medium pl-1 animate-fade-in">{errors.password.message}</p>
        )}
      </div>

      {submitError && (
        <div className="text-red-500 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20 font-medium">
          {submitError}
        </div>
      )}

      <Button
        type="submit"
        className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700 transition-colors font-semibold mt-2"
        disabled={activeSubmitting}
      >
        {activeSubmitting ? 'Signing in...' : 'Sign In'}
      </Button>

      <div className="text-center pt-2">
        <Link
          to={PageRoutes.register}
          className="text-neutral-400 hover:text-white transition-colors text-sm"
        >
          Don't have an account? Sign up
        </Link>
      </div>
    </form>
  );
};
