import axios from 'axios';
import { clearAccessToken, getAccessToken, setAccessToken } from './accessToken';

axios.defaults.withCredentials = true;

let isRefreshing = false;
let refreshWaitQueue = [];

function enqueueRefreshWaiter(resolve, reject) {
  refreshWaitQueue.push({ resolve, reject });
}

function flushRefreshQueue(error, token) {
  refreshWaitQueue.forEach((waiter) => {
    if (error) {
      waiter.reject(error);
      return;
    }
    waiter.resolve(token);
  });
  refreshWaitQueue = [];
}

axios.interceptors.request.use((config) => {
  if (config?._skipAuthRefresh) {
    return config;
  }

  const token = getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalConfig = error?.config;
    const status = error?.response?.status;
    const requestUrl = originalConfig?.url ?? '';

    const isAuthPath =
      requestUrl.includes('/api/auth/login') ||
      requestUrl.includes('/api/auth/register') ||
      requestUrl.includes('/api/auth/refresh');

    if (
      status !== 401 ||
      !originalConfig ||
      originalConfig._retry ||
      originalConfig._skipAuthRefresh ||
      isAuthPath
    ) {
      return Promise.reject(error);
    }

    originalConfig._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        enqueueRefreshWaiter(resolve, reject);
      })
        .then((newToken) => {
          originalConfig.headers = originalConfig.headers ?? {};
          originalConfig.headers.Authorization = `Bearer ${newToken}`;
          return axios(originalConfig);
        })
        .catch((queueError) => Promise.reject(queueError));
    }

    isRefreshing = true;

    try {
      const refreshResponse = await axios.post(
        '/api/auth/refresh',
        {},
        { _skipAuthRefresh: true, withCredentials: true },
      );

      const newAccessToken = refreshResponse?.data?.accessToken;
      setAccessToken(newAccessToken);
      flushRefreshQueue(null, newAccessToken);

      originalConfig.headers = originalConfig.headers ?? {};
      originalConfig.headers.Authorization = `Bearer ${newAccessToken}`;

      return axios(originalConfig);
    } catch (refreshError) {
      clearAccessToken();
      flushRefreshQueue(refreshError, null);
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);