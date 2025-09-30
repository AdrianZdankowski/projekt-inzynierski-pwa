import { FileMetadata } from './FileMetadata';

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
