import axiosInstance from '../api/axiosInstance';

export interface FileMetadata {
  id: string;
  fileName: string;
  mimeType: string;
  size: number;
  uploadTimestamp: string;
  status: string;
  userId: string;
  ownerName: string;
}

export const FileService = {
  async getUserFiles(): Promise<FileMetadata[]> {
    const response = (await axiosInstance.get('/file'));
    console.log(response.data);
    return response.data;
  },

  async deleteFile(fileId: string): Promise<void> {
    await axiosInstance.delete(`/file/${fileId}`);
  },

  async shareFile(fileId: string, userId: string): Promise<void> {
    await axiosInstance.post(`/file/${fileId}/share`, { userId });
  }
};
