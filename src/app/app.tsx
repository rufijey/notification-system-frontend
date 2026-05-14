import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { StoreProvider } from './providers/store/index';
import { AppRouter } from './router/index';
import { CryptoInitializer } from './providers/crypto-initializer';
import { initAuthThunk } from '@/features/auth/model/init-auth';
import { useSystemAlerts } from '@/features/system-alerts/model/use-system-alerts';
import type { AppDispatch, RootState } from './providers/store';
import { TopProgressBar } from '@/shared';
import './styles/index.css';

const AppContent = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isInit, isLoading } = useSelector((state: RootState) => state.user);

  useSystemAlerts();

  useEffect(() => {
    dispatch(initAuthThunk());
  }, [dispatch]);

  if (!isInit) {
    return (
      <>
        <TopProgressBar active={true} />
        <div className="h-screen w-screen bg-neutral-950" />
      </>
    );
  }

  return (
    <>
      <TopProgressBar active={isLoading} />
      <CryptoInitializer />
      <AppRouter />
    </>
  );
};

export const App = () => {
  return (
    <StoreProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </StoreProvider>
  );
};
