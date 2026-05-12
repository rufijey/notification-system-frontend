import { useSelector } from 'react-redux';
import type { RootState } from '@/app/providers/store';
import { LoginForm } from '@/features/auth/login';
import { Navigate } from 'react-router-dom';
import { PageRoutes } from '@/shared/config';

export const LoginPage = () => {
  const isAuth = useSelector((state: RootState) => state.user.isAuth);

  if (isAuth) {
    return <Navigate to={PageRoutes.channelBase} replace />;
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 bg-neutral-900 p-8 rounded-2xl border border-neutral-800 shadow-2xl">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-white tracking-tight">Notification System</h1>
          <p className="text-neutral-400">Securely connect and channel in real-time</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
};
