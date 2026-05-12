import { createAsyncThunk } from '@reduxjs/toolkit';
import { AuthService } from '../api/auth.service';
import { setAuth, setInitialized } from '@/entities/user/model/user.slice';

/**
 * initAuthThunk is meant to be dispatched at the root level (e.g., in App.tsx or main.tsx)
 * upon application startup. It attempts to restore the user session via silent refresh.
 */
export const initAuthThunk = createAsyncThunk(
  'auth/init',
  async (_, { dispatch }) => {
    try {
      // Attempt silent refresh using the RT cookie
      const data = await AuthService.refresh();
      // If successful, save the new AT and mark as authenticated
      dispatch(setAuth(data));
      return data;
    } catch (e) {
      // If refresh fails (e.g., cookie expired or missing), mark app as initialized
      // but the user will remain unauthenticated (isAuth: false)
      dispatch(setInitialized());
      throw e;
    }
  }
);
