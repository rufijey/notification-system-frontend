import { createSlice, createSelector, type PayloadAction } from '@reduxjs/toolkit';
import { setAccessToken } from '@/shared/api/base';
import { loginThunk, registerThunk, logoutThunk } from '@/features/auth/model/auth.thunks';

import { UserRole } from './types';

export interface UserState {
  currentUserId: string | null;
  fullName: string | null;
  avatarUrl: string | null;
  role: UserRole | null;
  accessToken: string | null;
  isAuth: boolean;
  isInit: boolean;
  isLoading: boolean;
}

const initialState: UserState = {
  currentUserId: null,
  fullName: null,
  avatarUrl: null,
  role: null,
  accessToken: null,
  isAuth: false,
  isInit: false,
  isLoading: false,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setAuth: (
      state,
      action: PayloadAction<{ userId: string; accessToken: string; fullName?: string; avatarUrl?: string; role?: UserRole }>
    ) => {
      state.currentUserId = action.payload.userId;
      state.fullName = action.payload.fullName ?? null;
      state.avatarUrl = action.payload.avatarUrl ?? null;
      state.role = action.payload.role ?? UserRole.USER;
      state.accessToken = action.payload.accessToken;
      state.isAuth = true;
      state.isInit = true;
      setAccessToken(action.payload.accessToken);
    },
    logout: (state) => {
      state.currentUserId = null;
      state.fullName = null;
      state.avatarUrl = null;
      state.role = null;
      state.accessToken = null;
      state.isAuth = false;
      state.isInit = true;
      setAccessToken(null);
    },
    setInitialized: (state) => {
      state.isInit = true;
    },
    setUserId: (state, action: PayloadAction<string>) => {
      state.currentUserId = action.payload;
      state.isAuth = true;
      state.isInit = true;
    },
    setFullName: (state, action: PayloadAction<string>) => {
      state.fullName = action.payload;
    },
    setAvatarUrl: (state, action: PayloadAction<string>) => {
      state.avatarUrl = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loginThunk.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(loginThunk.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(registerThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(registerThunk.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(registerThunk.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(logoutThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(logoutThunk.rejected, (state) => {
        state.isLoading = false;
      });
  },
});


export const { setAuth, logout, setInitialized, setUserId, setFullName, setAvatarUrl } = userSlice.actions;

const selectUserState = (state: { user: UserState }) => state.user;

export const selectCurrentUser = createSelector(
  [selectUserState],
  (user) => ({
    username: user.currentUserId,
    fullName: user.fullName,
    avatarUrl: user.avatarUrl,
    role: user.role,
  })
);

export default userSlice.reducer;
