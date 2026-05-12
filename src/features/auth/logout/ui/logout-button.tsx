import { useDispatch } from 'react-redux';
import { LogOut } from 'lucide-react';
import { logoutThunk } from '../../model/auth.thunks';
import type { AppDispatch } from '@/app/providers/store';

export const LogoutButton = () => {
  const dispatch = useDispatch<AppDispatch>();

  const handleLogout = () => {
    dispatch(logoutThunk());
  };

  return (
    <button
      onClick={handleLogout}
      className="p-2 text-neutral-500 hover:text-white hover:bg-white/5 rounded-lg transition-all"
      title="Logout"
    >
      <LogOut size={18} />
    </button>
  );
};
