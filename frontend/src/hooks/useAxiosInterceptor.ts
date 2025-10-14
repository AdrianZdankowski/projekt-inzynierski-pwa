import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';

let refreshPromise: Promise<string> | null = null;

export const useAxiosInterceptor = () => {
  const { accessToken, login, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // REQUEST INTERCEPTOR
    const requestInterceptor = axiosInstance.interceptors.request.use(
      (config) => {
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
        config.withCredentials = true;
        return config;
      },
      (error) => Promise.reject(error)
    );

    // RESPONSE INTERCEPTOR
    const responseInterceptor = axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (!error.response) {
          logout("network");
          navigate('/login', { replace: true });
          return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          if (!refreshPromise) {
            refreshPromise = axiosInstance
            .post('/auth/refresh-token', {}, {withCredentials: true})
            .then((res) => {
              const newAccessToken = res.data.accessToken;
              if (newAccessToken) {
                login(newAccessToken);
                return newAccessToken;
              }
              throw new Error("No access token in response!");
            })
            .finally(() => {
              refreshPromise = null;
            });
          }
          
          try {
            const newToken = await refreshPromise;
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return axiosInstance(originalRequest);
          }
          catch (refreshError) {
            logout("network");
            navigate('/login', { replace: true });
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axiosInstance.interceptors.request.eject(requestInterceptor);
      axiosInstance.interceptors.response.eject(responseInterceptor);
    };
  }, [accessToken, login, logout, navigate]);
};
