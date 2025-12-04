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

  async shareFolder(
    folderId: string,
    username: string,
    permissions: {
      canCreate: boolean;
      canDelete: boolean;
    }
  ): Promise<void> {
    let permissionFlags = 2; // Read is always included

    if (permissions.canCreate) {
      permissionFlags |= 1; // Create
    }

    if (permissions.canDelete) {
      permissionFlags |= 8; // Delete
    }

    await axiosInstance.post('/folder/permissions', {
      folderId,
      userName: username,
      permissions: permissionFlags,
    });
  },
};


