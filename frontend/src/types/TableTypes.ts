import { ReactNode } from 'react';

export interface TableColumn {
  id: string;
  labelKey: string;
  className?: string;
  align?: 'left' | 'center' | 'right';
  width?: string | number;
}

export interface TableAction<T> {
  id: string;
  labelKey: string;
  className?: string;
  icon: ReactNode;
  onClick: (row: T) => void;
}

export interface TableCellConfig {
  key: string;
  align: 'left' | 'center' | 'right';
  content: ReactNode;
}


