import axiosInstance from '../api/axiosInstance';
import { FileListResponse, FileListParams } from '../types/FileListTypes';
import { SingleFileMetadata } from '../types/SingleFileMetadata';
import { downloadFile as downloadFileUtil } from '../utils/downloadFile';
import { SortField } from '../types/SortTypes';

const mapSortFieldToBackend = (field?: SortField): string | undefined => {
  if (!field) return undefined;

  switch (field) {
    case 'name':
      return 'fileName';
    case 'date':
      return 'uploadTimestamp';
    default:
      return field;
  }
};

export const FileService = {
  async getUserFiles(params?: FileListParams): Promise<FileListResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    const sortBy = mapSortFieldToBackend(params?.sortBy);
    if (sortBy) queryParams.append('sortBy', sortBy);
    if (params?.sortDirection) queryParams.append('sortDirection', params.sortDirection);
    if (params?.q) queryParams.append('q', params.q);

    const response = await axiosInstance.get(`/file?${queryParams.toString()}`);
    return response.data;
  },

  async deleteFile(fileId: string): Promise<void> {
    await axiosInstance.delete(`/file/${fileId}`);
  },

  async deleteFileWithCacheCleanup(fileId: string): Promise<void> {
    await this.deleteFile(fileId);

    try {
      const metadataCache = await caches.open('file-metadata-cache');
      const metadataKeys = await metadataCache.keys();
      const metadataKey = metadataKeys.find(req => req.url.includes(`/api/file/${fileId}`));
      if (metadataKey) {
        await metadataCache.delete(metadataKey);
        console.log('Usunięto metadata z cache:', fileId);
      }

      const blobCache = await caches.open('azure-blob-files');
      const blobKeys = await blobCache.keys();
      const blobKey = blobKeys.find(req => req.url.includes(fileId));
      if (blobKey) {
        await blobCache.delete(blobKey);
        console.log('Usunięto blob z cache:', fileId);
      }
    } catch (cacheError) {
      console.warn('Nie udało się usunąć z cache:', cacheError);
    }
  },

  async shareFile(fileId: string, userId: string): Promise<void> {
    await axiosInstance.post(`/file/${fileId}/share`, { userId });
  },

  async shareFileDownload(fileId: string): Promise<void> {
    // TODO: Implement proper sharing endpoint in backend
    // For now, download the file
    await this.downloadFile(fileId);
  },

  async getUserFile(fileId: string): Promise<SingleFileMetadata> {
    const response = await axiosInstance.get(`/file/${fileId}`);
    return response.data;
  },

  async downloadFile(fileId: string): Promise<void> {
    await downloadFileUtil(fileId);
  }
};
