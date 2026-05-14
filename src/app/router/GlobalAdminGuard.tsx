import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import { selectCurrentUser } from '@/entities/user';
import { UserRole } from '@/entities/user/model/types';
import { PageRoutes } from '@/shared/config';

export const GlobalAdminGuard = () => {
  const user = useSelector(selectCurrentUser);

  if (!user || user.role !== UserRole.GLOBAL_ADMIN) {
    return <Navigate to={PageRoutes.channelBase} replace />;
  }

  return <Outlet />;
};
