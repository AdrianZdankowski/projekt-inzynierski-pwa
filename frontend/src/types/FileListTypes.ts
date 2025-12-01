import { FileMetadata } from './FileMetadata';
import { SortField, SortOrder } from './SortTypes';
import { ViewMode } from './FilterTypes';

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
  sortBy?: SortField;
  sortDirection?: SortOrder;
  q?: string;
  folderId?: string;
}

export interface FileListFilters {
  searchQuery: string;
  sortField: SortField;
  sortOrder: SortOrder;
  viewMode: ViewMode;
}

export interface FileListPaginationState {
  page: number;
  pageSize: number;
}