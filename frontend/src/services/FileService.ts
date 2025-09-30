import axiosInstance from '../api/axiosInstance';
import { FileMetadata } from '../types/FileMetadata';

export interface FileListResponse {
  items: FileMetadata[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  sortBy: string;
  sortDir: string;
  q: string | null;
}

export interface FileListParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: string;
  q?: string;
}

export const FileService = {
  async getUserFiles(params?: FileListParams): Promise<FileListResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortDirection) queryParams.append('sortDirection', params.sortDirection);
    if (params?.q) queryParams.append('q', params.q);

    const response = await axiosInstance.get(`/file?${queryParams.toString()}`);
    return response.data;
  },

  async deleteFile(fileId: string): Promise<void> {
    await axiosInstance.delete(`/file/${fileId}`);
  },

  async shareFile(fileId: string, userId: string): Promise<void> {
    await axiosInstance.post(`/file/${fileId}/share`, { userId });
  }
};
