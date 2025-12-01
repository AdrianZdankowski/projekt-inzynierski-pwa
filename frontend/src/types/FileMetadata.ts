export type UserItemType = 'file' | 'folder';

export interface FileMetadata {
  id: string;
  name: string;
  mimeType: string | null;
  size: number | null;
  date: string;
  status: number;
  userId: string;
  ownerName: string;
  type: UserItemType;
  isShared: boolean;
}