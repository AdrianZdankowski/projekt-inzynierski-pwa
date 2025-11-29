export const SORT_OPTIONS = [
  { field: 'name', label: 'Nazwa' },
  { field: 'size', label: 'Rozmiar' },
  { field: 'date', label: 'Data dodania' },
  { field: 'mimeType', label: 'Typ pliku' }
] as const;

export type SortField = 'name' | 'size' | 'date' | 'mimeType';
export type SortOrder = 'asc' | 'desc';

export const getSortLabel = (field: SortField, t: (key: string) => string): string => {
  const sortKeyMap: Record<SortField, string> = {
    name: 'fileListToolbar.sortOptions.name',
    size: 'fileListToolbar.sortOptions.size',
    date: 'fileListToolbar.sortOptions.date',
    mimeType: 'fileListToolbar.sortOptions.mimeType'
  };
  return t(sortKeyMap[field]);
};