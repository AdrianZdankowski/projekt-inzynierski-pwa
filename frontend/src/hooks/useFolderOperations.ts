import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNotification } from '../context/NotificationContext';
import { useOnlineStatus } from './useOnlineStatus';
import { FolderService } from '../services/FolderService';

export const useFolderOperations = () => {
  const { t } = useTranslation();
  const { showNotification } = useNotification();
  const isOnline = useOnlineStatus();

  const createFolder = useCallback(
    async (folderName: string, parentFolderId?: string | null): Promise<boolean> => {
      if (!isOnline) {
        showNotification(t('fileOperations.common.offlineError'), 'error');
        return false;
      }

      try {
        await FolderService.createFolder(folderName, parentFolderId ?? null);
        showNotification(t('fileOperations.folders.createdSuccess'), 'success');
        return true;
      } catch (err: any) {
        if (err.response?.status === 401) {
          showNotification(t('fileOperations.common.authRequired'), 'error');
        } else if (err.response?.status === 403) {
          showNotification(t('fileOperations.common.forbidden'), 'error');
        } else {
          showNotification(t('fileOperations.common.genericError'), 'error');
        }
        console.error('Error creating folder:', err);
        return false;
      }
    },
    [isOnline, showNotification, t]
  );

  const deleteFolder = useCallback(
    async (folderId: string): Promise<boolean> => {
      if (!isOnline) {
        showNotification(t('fileOperations.common.offlineError'), 'error');
        return false;
      }

      try {
        await FolderService.deleteFolder(folderId);
        showNotification(t('fileOperations.folders.deletedSuccess'), 'success');
        return true;
      } catch (err: any) {
        if (err.response?.status === 401) {
          showNotification(t('fileOperations.common.authRequired'), 'error');
        } else if (err.response?.status === 403) {
          showNotification(t('fileOperations.common.forbidden'), 'error');
        } else {
          showNotification(t('fileOperations.common.genericError'), 'error');
        }
        console.error('Error deleting folder:', err);
        return false;
      }
    },
    [isOnline, showNotification, t]
  );

  const shareFolder = useCallback(
    async (
      folderId: string,
      username: string,
      permissions: { canCreate: boolean; canDelete: boolean }
    ): Promise<boolean> => {
      if (!isOnline) {
        showNotification(t('fileOperations.common.offlineError'), 'error');
        return false;
      }

      try {
        await FolderService.shareFolder(folderId, username, permissions);
        showNotification(t('fileOperations.folders.shareSuccess') || t('fileOperations.files.shareSuccess'), 'success');
        return true;
      } catch (err: any) {
        console.error('Error sharing folder:', err);
        if (err.response?.status === 401) {
          showNotification(t('fileOperations.common.authRequired'), 'error');
        } else if (err.response?.status === 403) {
          showNotification(t('fileOperations.common.forbidden'), 'error');
        } else if (err.response?.status === 400) {
          showNotification(t('shareDialog.errors.userNotFound') || err.response?.data || t('fileOperations.common.genericError'), 'error');
        } else {
          showNotification(err.message || t('fileOperations.common.genericError'), 'error');
        }
        return false;
      }
    },
    [isOnline, showNotification, t]
  );

  return {
    createFolder,
    deleteFolder,
    shareFolder,
    isOnline,
  };
};

