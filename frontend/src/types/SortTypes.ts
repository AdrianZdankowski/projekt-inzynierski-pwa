export const SORT_OPTIONS = [
  { field: 'fileName', label: 'Nazwa' },
  { field: 'size', label: 'Rozmiar' },
  { field: 'uploadTimestamp', label: 'Data dodania' },
  { field: 'mimeType', label: 'Typ pliku' }
] as const;

export type SortField = 'fileName' | 'size' | 'uploadTimestamp' | 'mimeType';
export type SortOrder = 'asc' | 'desc';

export const getSortLabel = (field: SortField, t: (key: string) => string): string => {
  const sortKeyMap: Record<SortField, string> = {
    fileName: 'fileListToolbar.sortOptions.fileName',
    size: 'fileListToolbar.sortOptions.size',
    uploadTimestamp: 'fileListToolbar.sortOptions.uploadTimestamp',
    mimeType: 'fileListToolbar.sortOptions.mimeType'
  };
  return t(sortKeyMap[field]);
};