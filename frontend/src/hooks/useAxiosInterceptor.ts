import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { AxiosError } from 'axios';
import axiosInstance from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';

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

        // Czy to 401 i czy to nie jest już retry?
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const response = await axiosInstance.post(
              '/auth/refresh-token',
              {},
              { withCredentials: true }
            );

            const newAccessToken = response.data.accessToken;
            if (newAccessToken) {
              login(newAccessToken);
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
              return axiosInstance(originalRequest);
            }
          } catch (refreshError) {
            if ((refreshError as AxiosError).response?.status === 401) {
              logout();
              navigate('/login', { replace: true });
            }
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
