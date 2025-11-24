import { useState, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react';
import { Card, CardContent, CardActions, Typography, IconButton, Button, Box, Chip, 
  Alert, Tooltip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { Delete as DeleteIcon, Share as ShareIcon, CloudDone as SharedIcon } from '@mui/icons-material';
import { FileService } from '../services/FileService';
import { FileListResponse, FileListParams, FileListFilters, FileListPaginationState } from '../types/FileListTypes';
import { FileMetadata } from '../types/FileMetadata';
import { getFileIcon, getFileTypeColor, formatFileSize, formatDate } from '../utils/fileUtils';
import { useAuth } from '../context/AuthContext';
import { decodeUserId } from '../lib/decodeUserId';
import { useNotification } from '../context/NotificationContext';
import { UserIconBox } from '../themes/boxes/UserIconBox';
import { CardBox } from '../themes/boxes/CardBox';
import { FileTypeBox } from '../themes/boxes/FileTypeBox';
import VideoDialog from './VideoDialog';
import DocumentDialog from './DocumentDialog';
import ImageDialog from './ImageDialog';
import DeleteFileDialog from './DeleteFileDialog';
import FileListToolbar from './FileListToolbar';
import FileListPagination from './FileListPagination';
import { downloadFile } from '../utils/downloadFile';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export interface FileListRef {
  refreshFiles: () => void;
}

const FileList = forwardRef<FileListRef>((_, ref) => {
  const [fileListResponse, setFileListResponse] = useState<FileListResponse | null>(null);
  const [filters, setFilters] = useState<FileListFilters>({
    searchQuery: '',
    sortField: 'uploadTimestamp',
    sortOrder: 'desc',
    viewMode: 'grid'
  });
  const [pagination, setPagination] = useState<FileListPaginationState>({
    page: 1,
    pageSize: 10
  });
  const [selectedFile, setSelectedFile] = useState<FileMetadata | null>(null);
  const [isSelectedFileShared, setIsSelectedFileShared] = useState<boolean>(false);
  const [openVideoDialog, setOpenVideoDialog] = useState<boolean>(false);
  const [openDocumentDialog, setOpenDocumentDialog] = useState<boolean>(false);
  const [openImageDialog, setOpenImageDialog] = useState<boolean>(false);
  const [openDeleteFileDialog, setOpenDeleteFileDialog] = useState<boolean>(false);

  const { accessToken } = useAuth();
  const { showNotification } = useNotification();
  const isOnline = useOnlineStatus();

  const fetchFiles = useCallback(async () => {
    try {
      const params: FileListParams = {
        page: pagination.page,
        pageSize: pagination.pageSize,
        sortBy: filters.sortField,
        sortDirection: filters.sortOrder,
        q: filters.searchQuery || undefined
      };
      
      const response = await FileService.getUserFiles(params);
      setFileListResponse(response);
    } catch (err: any) {
      if (err.response?.status === 401) {
        showNotification('Wymagana autoryzacja. Zaloguj się ponownie.', 'error');
      } else if (err.response?.status === 403) {
        showNotification('Odmowa dostępu. Nie masz uprawnień do przeglądania plików.', 'error');
      } else {
        showNotification('Nie udało się załadować plików. Spróbuj ponownie.', 'error');
      }
      console.error('Error fetching files:', err);
    }
  }, [pagination, filters, showNotification]);
  
  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleFiltersChange = useCallback((newFilters: FileListFilters) => {
    setFilters(newFilters);
  }, []);

  const handlePaginationChange = useCallback((page: number, itemsPerPage: number) => {
    setPagination({ page, pageSize: itemsPerPage });
  }, []);

  const files = fileListResponse?.items || [];
  const totalItems = fileListResponse?.totalItems || 0;

  useImperativeHandle(ref, () => ({
    refreshFiles: fetchFiles
  }));

  const handleDeleteFile = async (fileId: string) => {
    if (!isOnline) {
      showNotification('Brak połączenia z internetem. Usuwanie plików dostępne jest tylko online.', 'error');
      return;
    }

    try {
      await FileService.deleteFile(fileId);
      setFileListResponse(prev => (
        {
          ...prev!,
          items: prev!.items.filter(f => f.id !== fileId)
        }
      ));
      showNotification('Plik został usunięty pomyślnie.', 'success');

      try {
        const metadataCache = await caches.open('file-metadata-cache');
        const metadataKeys = await metadataCache.keys();
        const metadataKey = metadataKeys.find(req => req.url.includes(`/api/file/${fileId}`));
        if (metadataKey) {
          await metadataCache.delete(metadataKey);
          console.log('Usunięto metadata z cache:', fileId);
        }

        const blobCache = await caches.open('azure-blob-files');
        const blobKeys = await blobCache.keys();
        const blobKey = blobKeys.find(req => req.url.includes(fileId));
        if (blobKey) {
          await blobCache.delete(blobKey);
          console.log('Usunięto blob z cache:', fileId);
        }
      } catch (cacheError) {
        console.warn('Nie udało się usunąć z cache:', cacheError);
      }
    } catch (err) {
      showNotification('Wystąpił nieoczekiwany błąd przy usuwaniu pliku. Spróbuj ponownie.', 'error');
    }
  };

  const handleShareFile = async (fileId: string) => {
    try {
      // TODO: Implement proper sharing endpoint in backend
      // For now, download the file
      
      if (!isOnline) {
        showNotification('Brak połączenia z internetem. Pobieranie dostępne jest tylko online.', 'error');
        return;
      }
      
      console.log('Share file:', fileId);
      await downloadFile(fileId);
      showNotification('Plik został pobrany pomyślnie.', 'success');
    } catch (err: any) {
      console.error('Error downloading file:', err);
      showNotification(err.message || 'Nie udało się pobrać pliku.', 'error');
    }
  };

  const handleFileClick = (file: FileMetadata, isShared: boolean) => {
    // TODO: Implement functionality in the future
    console.log('Open file:', file);

    // Open video page
    switch(file.mimeType) {
      case 'video/mp4':
        setSelectedFile(file);
        setIsSelectedFileShared(isShared);
        setOpenVideoDialog(true);
        break;
      case 'application/pdf':
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      case 'text/plain':
        setSelectedFile(file);
        setIsSelectedFileShared(isShared);
        setOpenDocumentDialog(true);
        break;
      case 'image/png':
      case 'image/jpeg':
      case 'image/gif':
        setSelectedFile(file);
        setIsSelectedFileShared(isShared);
        setOpenImageDialog(true);
        break;
    }
  };

  const isSharedFile = (file: FileMetadata) => {
    if (!accessToken) return false;
    const currentUserId = decodeUserId(accessToken);
    if (!currentUserId) return false;
    // File is shared if the owner is different from current user
    return file.userId !== currentUserId;
  };

  return (
    <Box sx={{ paddingTop: 3, paddingLeft: 3, paddingRight: 3, paddingBottom: 0 }}>
      {selectedFile && openVideoDialog && 
      (<VideoDialog open={openVideoDialog} onClose={() => {setOpenVideoDialog(false); setSelectedFile(null)}} file={selectedFile} isShared={isSelectedFileShared}/>)}
      {selectedFile && openDocumentDialog && 
      (<DocumentDialog open={openDocumentDialog} onClose={() => {setOpenDocumentDialog(false); setSelectedFile(null)}} file={selectedFile} isShared={isSelectedFileShared}/>)}
      {selectedFile && openImageDialog &&
      (<ImageDialog open={openImageDialog} onClose={() => {setOpenImageDialog(false); setSelectedFile(null)}} file={selectedFile} isShared={isSelectedFileShared}/>)}
      {selectedFile && openDeleteFileDialog && 
      (<DeleteFileDialog open={openDeleteFileDialog} onClose={() => {setOpenDeleteFileDialog(false); setSelectedFile(null)}}
      onConfirm={handleDeleteFile}
      file={selectedFile}
      />)}
      {(totalItems > 0 || filters.searchQuery.length > 0) && (
        <FileListToolbar
          onFiltersChange={handleFiltersChange}
        />
      )}

      {totalItems > 0 && filters.viewMode === 'grid' ? (
        <CardBox>
        {files.map((file) => {
          const FileIcon = getFileIcon(file.mimeType);
          const fileColor = getFileTypeColor(file.mimeType);
          const isShared = isSharedFile(file);

          return (
            <Box key={file.id}>
              <Card
                className="file-card"
                onClick={() => handleFileClick(file, isShared)}
              >
                {/* Delete button in top-right corner */}
                <IconButton
                  className="delete-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isOnline) {
                      showNotification('Brak połączenia z internetem. Usuwanie plików dostępne jest tylko online.', 'error');
                      return;
                    }
                    setSelectedFile(file);
                    setOpenDeleteFileDialog(true);
                  }}
                  size="small"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>

                {/* Shared indicator */}
                {isShared && (
                  <Chip
                    icon={<SharedIcon />}
                    label="Shared"
                    size="small"
                    className="shared-chip"
                  />
                )}

                <CardContent className="file-card-content">
                  {/* File type icon */}
                  <FileTypeBox>
                    <FileIcon
                      sx={{
                        fontSize: 64,
                        color: fileColor
                      }}
                    />
                  </FileTypeBox>

                  {/* File name */}
                  <Typography
                    component="div"
                    className="file-name"
                    title={file.fileName}
                  >
                    {file.fileName}
                  </Typography>

                  {/* File size and date */}
                  <Box sx={{ marginBottom: 1 }}>
                    <Typography className="file-size">
                      {formatFileSize(file.size)}
                    </Typography>
                    <Typography className="file-date">
                      {formatDate(file.uploadTimestamp)}
                    </Typography>
                  </Box>
                </CardContent>  

                <CardActions className="file-card-actions">
                  <Tooltip title="Udostępnij plik">
                    <Button
                      variant="outlined"
                      startIcon={<ShareIcon />}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(file);
                        handleShareFile(file.id);
                      }}
                      size="small"
                      className="share-button"
                    >
                      UDOSTĘPNIJ
                    </Button>
                  </Tooltip>
                </CardActions>
              </Card>
            </Box>
          );
        })}
        </CardBox>
      ) : totalItems > 0 && files.length > 0 ? (
        /* List View */
        <TableContainer 
          component={Paper} 
          className="files-table-container"
        >
          <Table>
            <TableHead>
              <TableRow className="table-header-row">
                <TableCell className="table-header-cell">Nazwa</TableCell>
                <TableCell className="table-header-cell-center">Właściciel</TableCell>
                <TableCell className="table-header-cell-center">Data modyfikacji</TableCell>
                <TableCell className="table-header-cell-center">Rozmiar pliku</TableCell>
                <TableCell align="center" className="table-header-cell-center">Akcje</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {files.map((file, index) => {
                const FileIcon = getFileIcon(file.mimeType);
                const fileColor = getFileTypeColor(file.mimeType);
                const isShared = isSharedFile(file);
                const isEvenRow = index % 2 === 0;

                return (
                  <TableRow 
                    key={file.id}
                    hover
                    className={isEvenRow ? 'table-body-row' : 'table-body-row-odd'}
                    onClick={() => handleFileClick(file, isShared)}
                  >
                    <TableCell className="table-body-cell">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <FileIcon sx={{ color: fileColor, fontSize: 24 }} />
                        {isShared && <SharedIcon sx={{ fontSize: 18, color: '#4CAF50' }} />}
                        <Typography className="table-file-name">
                          {file.fileName}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell className="table-body-cell-center">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
                        <UserIconBox>
                          {file.ownerName.charAt(0).toUpperCase()}
                        </UserIconBox>
                        <Typography className="table-owner-name">
                          {file.ownerName}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell className="table-body-cell-center">
                      <Typography className="table-date">
                        {formatDate(file.uploadTimestamp)}
                      </Typography>
                    </TableCell>
                    <TableCell className="table-body-cell-center">
                      <Typography className="table-size">
                        {formatFileSize(file.size)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center" className="table-actions-cell">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <Tooltip title="Udostępnij">
                          <IconButton
                            size="small"
                            className="table-share-button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleShareFile(file.id);
                            }}
                          >
                            <ShareIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Usuń">
                          <IconButton
                            size="small"
                            className="table-delete-button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!isOnline) {
                                showNotification('Brak połączenia z internetem. Usuwanie plików dostępne jest tylko online.', 'error');
                                return;
                              }
                              setSelectedFile(file);
                              setOpenDeleteFileDialog(true);
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      ) : null}

      {totalItems === 0 && (
        <Box sx={{ marginTop: 4 }}>
          <Alert 
            severity="info" 
            className="empty-files-alert"
          >
            <Typography className="alert-title">
              {filters.searchQuery ? 'Nie znaleziono plików' : 'Nie masz żadnych plików obecnie'}
            </Typography>
            <Typography className="alert-subtitle">
              {filters.searchQuery ? 'Spróbuj zmienić kryteria wyszukiwania' : 'Prześlij pliki, aby rozpocząć korzystanie z aplikacji'}
            </Typography>
          </Alert>
        </Box>
      )}

      <FileListPagination
        totalItems={totalItems}
        onPaginationChange={handlePaginationChange}
      />
    </Box>
  );
});

export default FileList;