import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { setAccessToken } from '@/shared/api/base';
import { loginThunk, registerThunk, logoutThunk } from '@/features/auth/model/auth.thunks';

export interface UserState {
  currentUserId: string | null;
  fullName: string | null;
  accessToken: string | null;
  isAuth: boolean;
  isInit: boolean;
  isLoading: boolean;
}

const initialState: UserState = {
  currentUserId: null,
  fullName: null,
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
      action: PayloadAction<{ userId: string; accessToken: string; fullName?: string }>
    ) => {
      state.currentUserId = action.payload.userId;
      state.fullName = action.payload.fullName ?? null;
      state.accessToken = action.payload.accessToken;
      state.isAuth = true;
      state.isInit = true;
      setAccessToken(action.payload.accessToken);
    },
    logout: (state) => {
      state.currentUserId = null;
      state.fullName = null;
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

export const { setAuth, logout, setInitialized, setUserId, setFullName } = userSlice.actions;
export default userSlice.reducer;
