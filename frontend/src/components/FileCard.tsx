import { Card, CardContent, CardActions, Typography, IconButton, Button, Box, Tooltip, Avatar, useTheme } from '@mui/material';
import { Delete as DeleteIcon, Share as ShareIcon, Download as DownloadIcon, Folder as FolderIcon, FolderShared as FolderSharedIcon, Star as StarIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { FileMetadata } from '../types/FileMetadata';
import { getFileIcon, getFileTypeColor, formatFileSize, formatDate } from '../utils/fileUtils';
import { useFileOperations } from '../hooks/useFileOperations';

interface FileCardProps {
  file: FileMetadata;
  isShared: boolean;
  canDeleteFromFolder?: boolean;
  onFileClick: (file: FileMetadata) => void;
  onDeleteDialogOpen: (file: FileMetadata) => void;
  onShareDialogOpen: (file: FileMetadata) => void;
}

const FileCard = ({
  file,
  isShared,
  canDeleteFromFolder = false,
  onFileClick,
  onDeleteDialogOpen,
  onShareDialogOpen
}: FileCardProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { downloadFile } = useFileOperations();
  const isFolder = file.type === 'folder';
  const FileIcon = isFolder ? (file.isShared ? FolderSharedIcon : FolderIcon) : getFileIcon(file.mimeType);
  const fileColor = getFileTypeColor(file.mimeType);
  
  const canDelete = !isShared || canDeleteFromFolder;
  const canShare = !isShared;

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteDialogOpen(file);
  };

  const handleDownloadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isFolder) {
      downloadFile(file.id);
    }
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onShareDialogOpen(file);
  };

  return (
    <Card
      sx={{
        width: '100%',
        aspectRatio: '1',
        maxWidth: '320px',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        position: 'relative',
        borderRadius: '16px',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        }
      }}
      onClick={() => onFileClick(file)}
    >
      {!isFolder && (
        <Tooltip title={t('fileCard.download')}>
          <IconButton
            sx={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              zIndex: '2',
              backgroundColor: theme.palette.background.paper,
              color: theme.palette.text.primary,
              '&:hover': {
                backgroundColor: theme.palette.mode === 'dark' 
                  ? theme.palette.grey[800] 
                  : theme.palette.grey[400],
              }
            }}
            onClick={handleDownloadClick}
            size="small"
          >
            <DownloadIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}

      {file.isShared && (
        <IconButton
          size="small"
          disabled
          sx={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            zIndex: '2',
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.warning.main,
            cursor: 'default',
            '&:hover': {
              backgroundColor: theme.palette.mode === 'dark' 
                ? theme.palette.grey[800] 
                : theme.palette.grey[400],
            },
            '&.Mui-disabled': {
              color: theme.palette.warning.main,
              backgroundColor: theme.palette.background.paper,
            }
          }}
        >
          <StarIcon fontSize="small" />
        </IconButton>
      )}

      {canDelete && (
        <Tooltip title={t('fileCard.delete')}>
          <IconButton
            sx={{
              position: 'absolute',
              top: file.isShared ? '48px' : '12px',
              right: '12px',
              zIndex: '2',
              backgroundColor: theme.palette.background.paper,
              color: theme.palette.text.primary,
              '&:hover': {
                backgroundColor: theme.palette.mode === 'dark' 
                  ? theme.palette.grey[800] 
                  : theme.palette.grey[400],
              }
            }}
            onClick={handleDeleteClick}
            size="small"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}

      <Box
        sx={{
          height: '140px',
          flexShrink: 0,
          backgroundColor: fileColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <FileIcon
          sx={{
            fontSize: '80px',
            opacity: '0.9',
            color: theme.palette.common.white,
          }}
        />
      </Box>

      <CardContent
        sx={{
          flex: '1 1 auto',
          padding: '16px',
          paddingBottom: canShare ? '8px' : '24px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          overflow: 'hidden',
          minHeight: '0px'
        }}
      >
        <Typography
          sx={{
            fontWeight: '750',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: '2',
            WebkitBoxOrient: 'vertical',
            fontSize: canShare ? '1.1rem' : '1.25rem',
            whiteSpace: "nowrap",
            maxWidth: { xs: "95%", sm: "95%" },
            lineHeight: '1.3',
            minHeight: '2em',
            color: theme.palette.text.primary,
            marginBottom: canShare ? '0px' : '7px',
            flexShrink: 0
          }}
          title={file.name}
        >
          {file.name}
        </Typography>

        <Box sx={{ marginBottom: canShare ? '2px' : '12px', flexShrink: 0 }}>
          <Typography
            sx={{
              fontSize: canShare ? '0.85rem' : '1.1rem',
              color: theme.palette.text.secondary,
              lineHeight: '1',
            }}
          >
            {isFolder
              ? formatDate(file.date, t)
              : `${formatFileSize(file.size ?? 0)} • ${formatDate(file.date, t)}`}
          </Typography>
        </Box>

        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          marginTop: 'auto',
          marginBottom: canShare ? '2px' : '8px',
          flexShrink: 0
        }}>
          <Avatar 
            sx={{ 
              width: '36px', 
              height: '36px',
              bgcolor: fileColor,
              fontSize: '1.25rem',
              color: theme.palette.background.paper,
            }}
          >
            {file.ownerName.charAt(0).toUpperCase()}
          </Avatar>
          <Typography
            sx={{
              fontSize: '1rem',
              fontWeight: '600',
              mt: '4px',
              color: theme.palette.text.secondary,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {file.ownerName}
          </Typography>
        </Box>
      </CardContent>  

      <CardActions
        sx={{
          justifyContent: 'center',
          padding: canShare ? '4px 16px 12px 16px' : '0px',
          minHeight: canShare ? '56px' : '0px',
          maxHeight: canShare ? '56px' : '0px',
          flexShrink: '0',
          display: canShare ? 'flex' : 'none',
          alignItems: 'center'
        }}
      >
        {canShare && (
          <Tooltip title={t('fileCard.shareFile')}>
            <Button
              variant="outlined"
              startIcon={<ShareIcon />}
              onClick={handleShareClick}
              size="medium"
              sx={{
                fontSize: '0.85rem',
                padding: '8px 24px',
                minWidth: 'auto',
                borderRadius: '12px',
                width: 'auto',
                fontWeight: '600',
              }}
            >
              {t('fileCard.share')}
            </Button>
          </Tooltip>
        )}
      </CardActions>
    </Card>
  );
};

export default FileCard;

