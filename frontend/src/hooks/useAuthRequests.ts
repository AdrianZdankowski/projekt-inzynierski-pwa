import { useCallback } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useTranslation } from 'react-i18next';

export const useAuthRequests = () => {
  const { login } = useAuth();
  const { showNotification } = useNotification();
  const { t } = useTranslation();

  const loginUser = useCallback(
    async (username: string, password: string): Promise<boolean> => {
      try {
        const result = await axiosInstance.post('/auth/login', { username, password });
        const accessToken = result.data.accessToken;

        if (!accessToken) {
          showNotification(t('login.generalError'), 'error');
          return false;
        }

        login(accessToken);
        showNotification(t('login.loginSuccess'), 'success');
        return true;
      } catch (error: any) {
        console.error(error);

        if (error.response?.status === 400) {
          showNotification(t('login.loginError'), 'error');
        } else {
          showNotification(t('login.generalError'), 'error');
        }

        return false;
      }
    },
    [login, showNotification, t]
  );

  const registerUser = useCallback(
    async (username: string, password: string): Promise<boolean> => {
      try {
        await axiosInstance.post('/auth/register', { username, password });
        showNotification(t('login.accountCreated'), 'success');
        return true;
      } catch (error: any) {
        console.error(error);

        if (error.response?.status === 400) {
          showNotification(t('register.userExistsError'), 'error');
        } else {
          showNotification(t('register.generalError'), 'error');
        }

        return false;
      }
    },
    [showNotification, t]
  );

  return {
    loginUser,
    registerUser,
  };
};


