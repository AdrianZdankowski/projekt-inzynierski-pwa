import { useState, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react';
import { Box, Alert, Typography, IconButton, Tooltip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { Delete as DeleteIcon, Share as ShareIcon, CloudDone as SharedIcon, Download as DownloadIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { FileListResponse, FileListParams, FileListFilters, FileListPaginationState } from '../types/FileListTypes';
import { FileMetadata } from '../types/FileMetadata';
import { getFileIcon, getFileTypeColor, formatFileSize, formatDate } from '../utils/fileUtils';
import { useAuth } from '../context/AuthContext';
import { decodeUserId } from '../lib/decodeUserId';
import { UserIconBox } from '../themes/boxes/UserIconBox';
import VideoDialog from './VideoDialog';
import DocumentDialog from './DocumentDialog';
import ImageDialog from './ImageDialog';
import DeleteFileDialog from './DeleteFileDialog';
import FileListToolbar from './FileListToolbar';
import FileListPagination from './FileListPagination';
import FileCard from './FileCard';
import { useFileOperations } from '../hooks/useFileOperations';

export interface FileListRef {
  refreshFiles: () => void;
}

const FileList = forwardRef<FileListRef>((_, ref) => {
  const [fileListResponse, setFileListResponse] = useState<FileListResponse | null>(null);
  const [filters, setFilters] = useState<FileListFilters>({
    searchQuery: '',
    sortField: 'date',
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
  const { t } = useTranslation();
  const { fetchFilesList, deleteFile, downloadFile, shareFile } = useFileOperations();
  
  const fetchFiles = useCallback(async () => {
    const params: FileListParams = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      sortBy: filters.sortField,
      sortDirection: filters.sortOrder,
      q: filters.searchQuery || undefined
    };
    
    const response = await fetchFilesList(params);
    if (response) {
      setFileListResponse(response);
    }
  }, [pagination, filters, fetchFilesList]);
  
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
    const success = await deleteFile(fileId);
    if (success) {
      setFileListResponse(prev => (
        {
          ...prev!,
          items: prev!.items.filter(f => f.id !== fileId)
        }
      ));
    }
  };
 
  const handleFileClick = (file: FileMetadata, isShared: boolean) => {
    console.log('Open file:', file);
    setSelectedFile(file);
    setIsSelectedFileShared(isShared);

    const mime = file.mimeType;

    if (mime === 'video/mp4') {
      setOpenVideoDialog(true);
      return;
    }

    if (
      mime === 'application/pdf' ||
      mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mime === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      mime === 'text/plain'
    ) {
      setOpenDocumentDialog(true);
      return;
    }

    if (
      mime === 'image/png' ||
      mime === 'image/jpeg' ||
      mime === 'image/gif'
    ) {
      setOpenImageDialog(true);
    }
  };

  const handleOpenDeleteDialog = (file: FileMetadata) => {
    setSelectedFile(file);
    setOpenDeleteFileDialog(true);
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
        <Box sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: 3,
          maxWidth: '1200px',
          margin: '0 auto',
        }}>
        {files.map((file) => {
          const isShared = isSharedFile(file);

          return (
            <Box
              key={file.id}
              sx={{
                width: {
                  xs: '100%',
                  md: 'calc((100% - 48px) / 3)',
                },
                maxWidth: {
                  xs: '100%',
                  md: '320px',
                },
              }}
            >
              <FileCard
                file={file}
                isShared={isShared}
                onFileClick={handleFileClick}
                onDeleteDialogOpen={handleOpenDeleteDialog}
              />
            </Box>
          );
        })}
        </Box>
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
                          {file.name}
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
                        {formatDate(file.date, t)}
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
                              shareFile(file.id);
                            }}
                          >
                            <ShareIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Pobierz">
                          <IconButton
                            size="small"
                            className="table-download-button"
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadFile(file.id);
                            }}
                          >
                            <DownloadIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Usuń">
                          <IconButton
                            size="small"
                            className="table-delete-button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenDeleteDialog(file);
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
        <Box sx={{ marginTop: '16px' }}>
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