import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '@/app/providers/store';
import { PageRoutes } from '@/shared/config';

import { Loader } from '@/shared';

export const ProtectedRoute = () => {
  const { isAuth, isInit } = useSelector((state: RootState) => state.user);

  if (!isInit) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-neutral-950 text-white">
        <Loader size="lg" />
      </div>
    );
  }

  if (!isAuth) {
    return <Navigate to={PageRoutes.login} replace />;
  }

  return <Outlet />;
};
