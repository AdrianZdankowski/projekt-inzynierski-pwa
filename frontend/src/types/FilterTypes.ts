export type ViewMode = 'grid' | 'list';

export const ITEMS_PER_PAGE_OPTIONS = [5, 10, 15, 20] as const;
export type ItemsPerPage = typeof ITEMS_PER_PAGE_OPTIONS[number];