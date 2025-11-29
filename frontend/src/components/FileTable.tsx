import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { FileMetadata } from '../types/FileMetadata';
import FileTableRow from './FileTableRow';
import { TableColumn } from '../types/TableTypes';

interface FileTableProps {
  files: FileMetadata[];
  isSharedFile: (file: FileMetadata) => boolean;
  onFileClick: (file: FileMetadata, isShared: boolean) => void;
  onDeleteDialogOpen: (file: FileMetadata) => void;
}

const FileTable = ({
  files,
  isSharedFile,
  onFileClick,
  onDeleteDialogOpen,
}: FileTableProps) => {
  const { t } = useTranslation();

  const columns: TableColumn[] = [
    {
      id: 'name',
      labelKey: 'fileTable.columns.name',
      align: 'left',
      width: '20%',
    },
    {
      id: 'owner',
      labelKey: 'fileTable.columns.owner',
      align: 'center',
      width: '25%',
    },
    {
      id: 'date',
      labelKey: 'fileTable.columns.date',
      align: 'center',
      width: '25%',
    },
    {
      id: 'size',
      labelKey: 'fileTable.columns.size',
      align: 'center',
      width: '15%',
    },
    {
      id: 'actions',
      labelKey: 'fileTable.columns.actions',
      align: 'center',
      width: '15%',
    },
  ];

  return (
    <TableContainer
      component={Paper}
      sx={{
        maxWidth: '100%',
        margin: '0 auto',
        borderRadius: '16px',
        overflow: 'hidden',
      }}

    >
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell
                key={column.id}
                align={column.align}
                sx={{
                  width: column.width,
                  fontWeight: 'bold',
                  fontSize: '0.9rem',
                  ...(column.align === 'center' && { textAlign: 'center' }),
                }}
              >
                {t(column.labelKey)}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {files.map((file) => {
            const isShared = isSharedFile(file);

            return (
              <FileTableRow
                key={file.id}
                file={file}
                isShared={isShared}
                onFileClick={onFileClick}
                onDeleteDialogOpen={onDeleteDialogOpen}
              />
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default FileTable;



