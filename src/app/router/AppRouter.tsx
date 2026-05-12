import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { PageRoutes } from '@/shared/config';
import { TopProgressBar } from '@/shared';

const LoginPage = lazy(() => import('../../pages/login-page').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('../../pages/register-page').then(m => ({ default: m.RegisterPage })));
const ChannelPage = lazy(() => import('../../pages/channel-page').then(m => ({ default: m.ChannelPage })));
const CreateChannelPage = lazy(() => import('../../pages/create-channel-page').then(m => ({ default: m.CreateChannelPage })));
const GlobalNotificationsPage = lazy(() => import('../../pages/global-notifications-page').then(m => ({ default: m.GlobalNotificationsPage })));

export const AppRouter = () => {
  return (
    <Suspense fallback={
      <>
        <TopProgressBar active={true} />
        <div className="h-screen w-screen bg-neutral-950" />
      </>
    }>
      <Routes>
        <Route path={PageRoutes.login} element={<LoginPage />} />
        <Route path={PageRoutes.register} element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path={PageRoutes.channelDetails} element={<ChannelPage />} />
          <Route path={PageRoutes.channelBase} element={<ChannelPage />} />
          <Route path={PageRoutes.createChannel} element={<CreateChannelPage />} />
          <Route path={PageRoutes.globalNotifications} element={<GlobalNotificationsPage />} />
        </Route>

        <Route path="*" element={<Navigate to={PageRoutes.channelBase} replace />} />
      </Routes>
    </Suspense>
  );
};
