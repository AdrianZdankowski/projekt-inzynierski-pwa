import { useCallback } from 'react';
import { useNotification } from '../context/NotificationContext';
import { useOnlineStatus } from './useOnlineStatus';
import { FileService } from '../services/FileService';
import { FileListParams, FileListResponse } from '../types/FileListTypes';

export const useFileOperations = () => {
  const { showNotification } = useNotification();
  const isOnline = useOnlineStatus();

  const fetchFilesList = useCallback(
    async (params: FileListParams): Promise<FileListResponse | null> => {
      try {
        const response = await FileService.getUserFiles(params);
        return response;
      } catch (err: any) {
        if (err.response?.status === 401) {
          showNotification('Wymagana autoryzacja. Zaloguj się ponownie.', 'error');
        } else if (err.response?.status === 403) {
          showNotification('Odmowa dostępu. Nie masz uprawnień do przeglądania plików.', 'error');
        } else {
          showNotification('Nie udało się załadować plików. Spróbuj ponownie.', 'error');
        }
        console.error('Error fetching files:', err);
        return null;
      }
    },
    [showNotification]
  );

  const deleteFile = useCallback(
    async (fileId: string): Promise<boolean> => {
      if (!isOnline) {
        showNotification('Brak połączenia z internetem. Usuwanie plików dostępne jest tylko online.', 'error');
        return false;
      }

      try {
        await FileService.deleteFileWithCacheCleanup(fileId);
        showNotification('Plik został usunięty pomyślnie.', 'success');
        return true;
      } catch (err: any) {
        if (err.response?.status === 401) {
          showNotification('Wymagana autoryzacja. Zaloguj się ponownie.', 'error');
        } else if (err.response?.status === 403) {
          showNotification('Odmowa dostępu. Nie masz uprawnień do usunięcia tego pliku.', 'error');
        } else {
          showNotification('Wystąpił nieoczekiwany błąd przy usuwaniu pliku. Spróbuj ponownie.', 'error');
        }
        console.error('Error deleting file:', err);
        return false;
      }
    },
    [isOnline, showNotification]
  );

  const downloadFile = useCallback(
    async (fileId: string): Promise<void> => {
      if (!isOnline) {
        showNotification('Brak połączenia z internetem. Pobieranie dostępne jest tylko online.', 'error');
        return;
      }

      try {
        await FileService.downloadFile(fileId);
        showNotification('Plik został pobrany pomyślnie.', 'success');
      } catch (err: any) {
        console.error('Error downloading file:', err);
        if (err.response?.status === 401) {
          showNotification('Wymagana autoryzacja. Zaloguj się ponownie.', 'error');
        } else if (err.response?.status === 403) {
          showNotification('Odmowa dostępu. Nie masz uprawnień do pobrania tego pliku.', 'error');
        } else {
          showNotification(err.message || 'Nie udało się pobrać pliku.', 'error');
        }
      }
    },
    [isOnline, showNotification]
  );

  const shareFile = useCallback(
    async (fileId: string): Promise<void> => {
      if (!isOnline) {
        showNotification('Brak połączenia z internetem. Pobieranie dostępne jest tylko online.', 'error');
        return;
      }

      try {
        await FileService.shareFileDownload(fileId);
        showNotification('Plik został pobrany pomyślnie.', 'success');
      } catch (err: any) {
        console.error('Error sharing file:', err);
        showNotification(err.message || 'Nie udało się pobrać pliku.', 'error');
      }
    },
    [isOnline, showNotification]
  );

  return {
    fetchFilesList,
    deleteFile,
    downloadFile,
    shareFile,
    isOnline,
  };
};

