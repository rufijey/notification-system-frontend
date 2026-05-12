import { createAsyncThunk } from '@reduxjs/toolkit';
import { AuthService } from '../api/auth.service';
import type { LoginDto, RegisterDto } from '../api/types';
import { setAuth, logout } from '@/entities/user/model/user.slice';

export const loginThunk = createAsyncThunk(
  'auth/login',
  async (dto: LoginDto, { dispatch, rejectWithValue }) => {
    try {
      const data = await AuthService.login(dto);
      dispatch(setAuth(data));
      return data;
    } catch (e: any) {
      return rejectWithValue(e.message);
    }
  }
);

export const registerThunk = createAsyncThunk(
  'auth/register',
  async (dto: RegisterDto, { dispatch, rejectWithValue }) => {
    try {
      const data = await AuthService.register(dto);
      dispatch(setAuth(data));
      return data;
    } catch (e: any) {
      return rejectWithValue(e.message);
    }
  }
);

export const logoutThunk = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch }) => {
    try {
      await AuthService.logout();
    } finally {
      dispatch(logout());
    }
  }
);
