import { Card, CardContent, CardActions, Typography, IconButton, Button, Box, Tooltip, Avatar, useTheme } from '@mui/material';
import { Delete as DeleteIcon, Share as ShareIcon, Download as DownloadIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { FileMetadata } from '../types/FileMetadata';
import { getFileIcon, getFileTypeColor, formatFileSize, formatDate } from '../utils/fileUtils';
import { useFileOperations } from '../hooks/useFileOperations';

interface FileCardProps {
  file: FileMetadata;
  isShared: boolean;
  onFileClick: (file: FileMetadata, isShared: boolean) => void;
  onDeleteDialogOpen: (file: FileMetadata) => void;
}

const FileCard = ({
  file,
  isShared,
  onFileClick,
  onDeleteDialogOpen
}: FileCardProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { downloadFile, shareFile } = useFileOperations();
  const FileIcon = getFileIcon(file.mimeType);
  const fileColor = getFileTypeColor(file.mimeType);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteDialogOpen(file);
  };

  const handleDownloadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    downloadFile(file.id);
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    shareFile(file.id);
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
      onClick={() => onFileClick(file, isShared)}
    >
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

      <Tooltip title={t('fileCard.delete')}>
        <IconButton
          sx={{
            position: 'absolute',
            top: '12px',
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

      <Box
        sx={{
          height: '140px',
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
          flexGrow: '1',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          overflow: 'hidden'
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
            fontSize: '1.25rem',
            lineHeight: '1.3',
            minHeight: '2em',
            color: theme.palette.text.primary,
          }}
          title={file.name}
        >
          {file.name}
        </Typography>

        <Box sx={{ marginBottom: '12px' }}>
          <Typography
            sx={{
              fontSize: '0.9rem',
              color: theme.palette.text.secondary,
              lineHeight: '1.5',
            }}
          >
            {formatFileSize(file.size)} • {formatDate(file.date, t)}
          </Typography>
        </Box>

        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          marginBottom: '8px'
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
          padding: '8px 16px 16px 16px',
          minHeight: 'auto',
          flexShrink: '0'
        }}
      >
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
      </CardActions>
    </Card>
  );
};

export default FileCard;

