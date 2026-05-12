import { createApi, type BaseQueryFn } from '@reduxjs/toolkit/query/react';

export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

let _accessToken: string | null = null;
let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

export const setAccessToken = (token: string | null) => {
  _accessToken = token;
};

const processQueue = (token: string | null) => {
  refreshQueue.forEach((callback) => callback(token));
  refreshQueue = [];
};

export interface CustomRequestInit extends RequestInit {
  useAuth?: boolean;
}

export const $api = async (endpoint: string, init: CustomRequestInit = {}): Promise<Response> => {
  const { useAuth = true, ...options } = init;

  const headers = new Headers(options.headers);

  if (useAuth && _accessToken) {
    headers.set('Authorization', `Bearer ${_accessToken}`);
  }

  const config: RequestInit = {
    ...options,
    headers,
    credentials: 'include', // Ensure HttpOnly cookies (RT) are sent/received
  };

  const url = `${BASE_URL}${endpoint}`;
  let response = await fetch(url, config);

  // Handle 401 Unauthorized
  if (response.status === 401 && useAuth) {
    // If a refresh is already in progress, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push((token) => {
          if (token) {
            headers.set('Authorization', `Bearer ${token}`);
            resolve(fetch(url, { ...config, headers }));
          } else {
            reject(new Error('Session expired'));
          }
        });
      });
    }

    isRefreshing = true;

    try {
      // Attempt silent refresh
      const refreshResponse = await fetch(`${BASE_URL}/users/refresh`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!refreshResponse.ok) {
        throw new Error('Refresh failed');
      }

      const data = await refreshResponse.json();
      const newToken = data.accessToken;

      setAccessToken(newToken);
      processQueue(newToken);
      isRefreshing = false;

      // Retry original request
      headers.set('Authorization', `Bearer ${newToken}`);
      return fetch(url, { ...config, headers });
    } catch (error) {
      processQueue(null);
      isRefreshing = false;
      throw error;
    }
  }

  return response;
};

const customBaseQuery: BaseQueryFn<
  {
    url: string;
    method?: string;
    body?: unknown;
    headers?: HeadersInit;
    useAuth?: boolean;
  },
  unknown,
  unknown
> = async ({ url, method, body, headers, useAuth }) => {
  try {
    const response = await $api(url, {
      method,
      body: body ? JSON.stringify(body) : undefined,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      useAuth,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ notification: 'Unknown error' }));
      return { error: { status: response.status, data: errorData } };
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return { error: { status: 'FETCH_ERROR', message: error instanceof Error ? error.message : 'Unknown error' } };
  }
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: customBaseQuery,
  tagTypes: ['Channels', 'History', 'Members'],
  endpoints: () => ({}),
});
