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
  Share as ShareIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Folder as FolderIcon,
  FolderShared as FolderSharedIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { FileMetadata } from '../../types/FileMetadata';
import { getFileIcon, getFileTypeColor, formatFileSize, formatDate } from '../../utils/fileUtils';
import { TableAction, TableCellConfig } from '../../types/TableTypes';
import { useFileOperations } from '../../hooks/useFileOperations';

interface FileTableRowProps {
  file: FileMetadata;
  isShared: boolean;
  canDeleteFromFolder?: boolean;
  onFileClick: (file: FileMetadata) => void;
  onDeleteDialogOpen: (file: FileMetadata) => void;
  onShareDialogOpen: (file: FileMetadata) => void;
}

const FileTableRow = ({
  file,
  isShared,
  canDeleteFromFolder = false,
  onFileClick,
  onDeleteDialogOpen,
  onShareDialogOpen,
}: FileTableRowProps) => {
  const { t } = useTranslation();
  const { downloadFile } = useFileOperations();
  const theme = useTheme();
  const isFolder = file.type === 'folder';
  const FileIcon = isFolder ? (file.isShared ? FolderSharedIcon : FolderIcon) : getFileIcon(file.mimeType);
  const fileColor = getFileTypeColor(file.mimeType);

  const canDelete = !isShared || canDeleteFromFolder;
  const canShare = !isShared;

  const actions: TableAction<FileMetadata>[] = [];
  
  if (canShare) {
    actions.push({
      id: 'share',
      labelKey: 'fileTable.actions.share',
      icon: <ShareIcon fontSize="small" />,
      onClick: (row) => onShareDialogOpen(row),
    });
  }
  
  if (!isFolder) {
    actions.push({
      id: 'download',
      labelKey: 'fileTable.actions.download',
      icon: <DownloadIcon fontSize="small" />,
      onClick: (row) => downloadFile(row.id),
    });
  }
  
  if (canDelete) {
    actions.push({
      id: 'delete',
      labelKey: 'fileTable.actions.delete',
      icon: <DeleteIcon fontSize="small" />,
      onClick: (row) => onDeleteDialogOpen(row),
    });
  }

  const handleRowClick = (event: React.MouseEvent<HTMLTableRowElement>) => {
    event.stopPropagation();
    onFileClick(file);
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
            gap: '12px',
            position: 'relative'
        }}>
          <FileIcon sx={{ color: fileColor, fontSize: '24px' }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Typography
              title={file.name}
              sx={{
                fontWeight: 'medium',
                fontSize: '0.9rem',
                lineHeight: '1',
                mt: '0.2rem',
                maxWidth: { xs: '140px', sm: '220px', md: '260px' },
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {file.name}
            </Typography>
            {file.isShared && (
              <IconButton
                size="small"
                disabled
                sx={{
                  color: theme.palette.warning.main,
                  cursor: 'default',
                  padding: '2px',
                  marginLeft: '2px',
                  '&:hover': {
                    backgroundColor: 'transparent',
                  },
                  '&.Mui-disabled': {
                    color: theme.palette.warning.main,
                  }
                }}
              >
                <StarIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
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
            gap: '12px',
            marginLeft: '24px' 
        }}>
          <Avatar
            sx={{
              width: '32px',
              height: '32px',
              bgcolor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              fontSize: '0.85rem',
              fontWeight: 'bold',
              flexShrink: 0,
            }}
          >
            {file.ownerName.charAt(0).toUpperCase()}
          </Avatar>
          <Typography
            sx={{
              fontSize: '0.9rem',
              lineHeight: '1',
              mt: '0.2rem',
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
            mt: '0.2rem',
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
            mt: '0.2rem',
          }}
        >
          {isFolder ? '-' : formatFileSize(file.size ?? 0)}
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
        <Box
          sx={{
            display: 'flex',
            gap: '8px',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {actions.length > 0 ? (
            actions.map((action) => (
              <Tooltip key={action.id} title={t(action.labelKey)}>
                <IconButton
                  size="small"
                  sx={{
                    color:
                      action.id === 'share'
                        ? theme.palette.info.main
                        : theme.palette.grey[500],
                  }}
                  onClick={(e) => handleActionClick(e, action)}
                >
                  {action.icon}
                </IconButton>
              </Tooltip>
            ))
          ) : (
            <Typography
              sx={{
                color: theme.palette.text.secondary,
                fontSize: '0.9rem',
              }}
            >
              -
            </Typography>
          )}
        </Box>
      </TableCell>
    </TableRow>
  );
};

export default FileTableRow;
