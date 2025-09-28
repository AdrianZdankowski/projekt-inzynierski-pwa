  import axiosInstance from '../api/axiosInstance';
  import { FileMetadata } from '../types/FileMetadata';

export const FileService = {
  async getUserFiles(): Promise<FileMetadata[]> {
    const response = (await axiosInstance.get('/file'));
    return response.data;
  },

  async deleteFile(fileId: string): Promise<void> {
    await axiosInstance.delete(`/file/${fileId}`);
  },

  async shareFile(fileId: string, userId: string): Promise<void> {
    await axiosInstance.post(`/file/${fileId}/share`, { userId });
  }
};
