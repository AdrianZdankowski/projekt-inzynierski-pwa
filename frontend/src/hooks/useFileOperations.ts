import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNotification } from '../context/NotificationContext';
import { useOnlineStatus } from './useOnlineStatus';
import { FileService } from '../services/FileService';
import { FolderService } from '../services/FolderService';
import { FileListParams, FileListResponse } from '../types/FileListTypes';

export const useFileOperations = () => {
  const { t } = useTranslation();
  const { showNotification } = useNotification();
  const isOnline = useOnlineStatus();

  const fetchFilesList = useCallback(
    async (params: FileListParams): Promise<FileListResponse | null> => {
      try {
        const response = await FileService.getUserFiles(params);
        return response;
      } catch (err: any) {
        if (err.response?.status === 401) {
          showNotification(t('fileOperations.common.authRequired'), 'error');
        } else if (err.response?.status === 403) {
          showNotification(t('fileOperations.common.forbidden'), 'error');
        } else {
          showNotification(t('fileOperations.common.fetchError'), 'error');
        }
        console.error('Error fetching files:', err);
        return null;
      }
    },
    [showNotification]
  );

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
    [isOnline, showNotification]
  );

  const deleteFile = useCallback(
    async (fileId: string): Promise<boolean> => {
      if (!isOnline) {
        showNotification(t('fileOperations.common.offlineError'), 'error');
        return false;
      }

      try {
        await FileService.deleteFileWithCacheCleanup(fileId);
        showNotification(t('fileOperations.files.deleteSuccess'), 'success');
        return true;
      } catch (err: any) {
        if (err.response?.status === 401) {
          showNotification(t('fileOperations.common.authRequired'), 'error');
        } else if (err.response?.status === 403) {
          showNotification(t('fileOperations.common.forbidden'), 'error');
        } else {
          showNotification(t('fileOperations.common.genericError'), 'error');
        }
        console.error('Error deleting file:', err);
        return false;
      }
    },
    [isOnline, showNotification]
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
    [isOnline, showNotification]
  );

  const downloadFile = useCallback(
    async (fileId: string): Promise<void> => {
      if (!isOnline) {
        showNotification(t('fileOperations.common.offlineError'), 'error');
        return;
      }

      try {
        await FileService.downloadFile(fileId);
        showNotification(t('fileOperations.files.downloadSuccess'), 'success');
      } catch (err: any) {
        console.error('Error downloading file:', err);
        if (err.response?.status === 401) {
          showNotification(t('fileOperations.common.authRequired'), 'error');
        } else if (err.response?.status === 403) {
          showNotification(t('fileOperations.common.forbidden'), 'error');
        } else {
          showNotification(err.message || t('fileOperations.common.genericError'), 'error');
        }
      }
    },
    [isOnline, showNotification]
  );

  const shareFile = useCallback(
    async (fileId: string): Promise<void> => {
      if (!isOnline) {
        showNotification(t('fileOperations.common.offlineError'), 'error');
        return;
      }

      try {
        await FileService.shareFileDownload(fileId);
        showNotification(t('fileOperations.files.shareSuccess'), 'success');
      } catch (err: any) {
        console.error('Error sharing file:', err);
        showNotification(err.message || t('fileOperations.common.genericError'), 'error');
      }
    },
    [isOnline, showNotification]
  );

  return {
    fetchFilesList,
    deleteFile,
    deleteFolder,
    downloadFile,
    shareFile,
    createFolder,
    isOnline,
  };
};

