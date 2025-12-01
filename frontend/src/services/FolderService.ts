import axiosInstance from '../api/axiosInstance';

export const FolderService = {
  async createFolder(folderName: string, parentFolderId?: string | null) {
    const payload = {
      folderName,
      parentFolderId: parentFolderId ?? null,
      createdDate: new Date().toISOString(),
    };

    const response = await axiosInstance.post('/folder', payload);
    return response.data;
  },

  async deleteFolder(folderId: string) {
    await axiosInstance.delete(`/folder/${folderId}`);
  },
};


