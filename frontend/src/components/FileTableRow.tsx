import { MouseEvent } from 'react';
import {
  TableRow,
  TableCell,
  Box,
  Typography,
  IconButton,
  Tooltip,
  Avatar,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  CloudDone as SharedIcon,
  Share as ShareIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { FileMetadata } from '../types/FileMetadata';
import { getFileIcon, getFileTypeColor, formatFileSize, formatDate } from '../utils/fileUtils';
import { TableAction, TableCellConfig } from '../types/TableTypes';
import { useFileOperations } from '../hooks/useFileOperations';

interface FileTableRowProps {
  file: FileMetadata;
  isShared: boolean;
  onFileClick: (file: FileMetadata, isShared: boolean) => void;
  onDeleteDialogOpen: (file: FileMetadata) => void;
}

const FileTableRow = ({
  file,
  isShared,
  onFileClick,
  onDeleteDialogOpen,
}: FileTableRowProps) => {
  const { t } = useTranslation();
  const { downloadFile, shareFile } = useFileOperations();
  const theme = useTheme();
  const FileIcon = getFileIcon(file.mimeType);
  const fileColor = getFileTypeColor(file.mimeType);

  const actions: TableAction<FileMetadata>[] = [
    {
      id: 'share',
      labelKey: 'fileTable.actions.share',
      icon: <ShareIcon fontSize="small" />,
      onClick: (row) => shareFile(row.id),
    },
    {
      id: 'download',
      labelKey: 'fileTable.actions.download',
      icon: <DownloadIcon fontSize="small" />,
      onClick: (row) => downloadFile(row.id),
    },
    {
      id: 'delete',
      labelKey: 'fileTable.actions.delete',
      icon: <DeleteIcon fontSize="small" />,
      onClick: (row) => onDeleteDialogOpen(row),
    },
  ];

  const handleRowClick = (event: React.MouseEvent<HTMLTableRowElement>) => {
    event.stopPropagation();
    onFileClick(file, isShared);
  };

  const handleActionClick = (e: MouseEvent, action: TableAction<FileMetadata>) => {
    e.stopPropagation();
    action.onClick(file);
  };

  const tableCells: TableCellConfig[] = [
    {
      key: 'name',
      align: 'left',
      content: (
        <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px' 
        }}>
          <FileIcon sx={{ color: fileColor, fontSize: '24px' }} />
          {isShared && <SharedIcon sx={{ fontSize: '18px', color: theme.palette.success.main }} />}
          <Typography
            sx={{
              fontWeight: 'medium',
              fontSize: '0.9rem',
              lineHeight: '1',
              mt: '0.3rem',
            }}
          >
            {file.name}
          </Typography>
        </Box>
      ),
    },
    {
      key: 'owner',
      align: 'center',
      content: (
        <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '12px' 
        }}>
          <Avatar
            sx={{
              width: '32px',
              height: '32px',
              bgcolor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              fontSize: '0.85rem',
              fontWeight: 'bold',
            }}
          >
            {file.ownerName.charAt(0).toUpperCase()}
          </Avatar>
          <Typography
            sx={{
              fontSize: '0.9rem',
              lineHeight: '1'
            }}
          >
            {file.ownerName}
          </Typography>
        </Box>
      ),
    },
    {
      key: 'date',
      align: 'center',
      content: (
        <Typography
          sx={{
            lineHeight: '1',
            mt: '0.3rem',
          }}
        >
          {formatDate(file.date, t)}
        </Typography>
      ),
    },
    {
      key: 'size',
      align: 'center',
      content: (
        <Typography
          sx={{
            lineHeight: '1',
            mt: '0.3rem',
          }}
        >
          {formatFileSize(file.size)}
        </Typography>
      ),
    },
  ];

  return (
    <TableRow
      hover
      onClick={handleRowClick}
      sx={{
        cursor: 'pointer',
        '&:last-of-type td, &:last-of-type th': {
          borderBottom: 0,
        },
      }}
    >
      {tableCells.map((cell) => (
        <TableCell
          key={cell.key}
          align={cell.align}
          sx={{
            textAlign: cell.align === 'center' ? 'center' : 'left',
          }}
        >
          {cell.content}
        </TableCell>
      ))}
      <TableCell
        align="center"
        sx={{
          py: {
            xs: '10px',
            md: '16px',
          },
        }}
      >
        <Box sx={{ 
            display: 'flex', 
            gap: '8px', 
            justifyContent: 'center' 
        }}>
          {actions.map((action) => (
            <Tooltip key={action.id} title={t(action.labelKey)}>
              <IconButton
                size="small"
                sx={{
                  color: action.id === 'share' ? theme.palette.info.main : theme.palette.grey[500],
                }}
                onClick={(e) => handleActionClick(e, action)}
              >
                {action.icon}
              </IconButton>
            </Tooltip>
          ))}
        </Box>
      </TableCell>
    </TableRow>
  );
};

export default FileTableRow;
