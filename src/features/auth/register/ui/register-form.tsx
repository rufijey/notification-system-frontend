import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { registerThunk } from '../../model/auth.thunks';
import type { AppDispatch } from '@/app/providers/store';
import { Button, Input } from '@/shared';
import { Link } from 'react-router-dom';
import { cn } from '@/shared/lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PageRoutes } from '@/shared/config';

const registerSchema = z.object({
  username: z.string()
    .min(1, 'Username is required')
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username cannot exceed 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores are allowed'),
  fullName: z.string()
    .min(1, 'Full name is required')
    .min(2, 'Full name must be at least 2 characters'),
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z.string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

type RegisterFields = z.infer<typeof registerSchema>;

export const RegisterForm = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmittingState, setIsSubmittingState] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFields>({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched',
  });

  const onSubmit = async (data: RegisterFields) => {
    setSubmitError(null);
    setIsSubmittingState(true);
    try {
      const result = await dispatch(registerThunk(data));

      if (registerThunk.rejected.match(result)) {
        const message = result.payload as string || 'Registration failed';
        
        if (message === 'User with this email already exists') {
          setError('email', { type: 'manual', message: 'Email is already registered' });
          setSubmitError('This email is already in use');
        } else if (message === 'Username already taken') {
          setError('username', { type: 'manual', message: 'Username is already taken' });
          setSubmitError('This username is already taken');
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
        <label className="text-sm font-medium text-neutral-300">Username</label>
        <Input
          type="text"
          placeholder="johndoe"
          {...register('username')}
          className={cn(
            "h-12 text-white transition-all bg-neutral-950 border-neutral-800",
            errors.username && "border-red-500/80 focus-visible:ring-red-500 bg-red-500/5"
          )}
          disabled={activeSubmitting}
        />
        {errors.username && (
          <p className="text-red-400 text-xs font-medium pl-1 leading-tight">{errors.username.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-300">Full Name</label>
        <Input
          type="text"
          placeholder="John Doe"
          {...register('fullName')}
          className={cn(
            "h-12 text-white transition-all bg-neutral-950 border-neutral-800",
            errors.fullName && "border-red-500/80 focus-visible:ring-red-500 bg-red-500/5"
          )}
          disabled={activeSubmitting}
        />
        {errors.fullName && (
          <p className="text-red-400 text-xs font-medium pl-1 leading-tight">{errors.fullName.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-300">Email</label>
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
          <p className="text-red-400 text-xs font-medium pl-1 leading-tight">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-300">Password</label>
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
          <p className="text-red-400 text-xs font-medium pl-1 leading-tight">{errors.password.message}</p>
        )}
      </div>

      {submitError && (
        <div className="text-red-500 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20 font-medium leading-tight">
          {submitError}
        </div>
      )}

      <Button
        type="submit"
        className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700 transition-colors font-semibold mt-2"
        disabled={activeSubmitting}
      >
        {activeSubmitting ? 'Creating Account...' : 'Create Account'}
      </Button>

      <div className="text-center pt-2">
        <Link
          to={PageRoutes.login}
          className="text-neutral-400 hover:text-white transition-colors text-sm"
        >
          Already have an account? Sign in
        </Link>
      </div>
    </form>
  );
};
