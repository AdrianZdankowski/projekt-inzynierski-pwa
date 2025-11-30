import { useState, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react';
import { Box, Typography, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { FileListResponse, FileListParams, FileListFilters, FileListPaginationState } from '../types/FileListTypes';
import { FileMetadata } from '../types/FileMetadata';
import { useAuth } from '../context/AuthContext';
import { decodeUserId } from '../utils/decodeUserId';
import VideoDialog from './VideoDialog';
import DocumentDialog from './DocumentDialog';
import ImageDialog from './ImageDialog';
import DeleteFileDialog from './DeleteFileDialog';
import FileListToolbar from './FileListToolbar';
import FileListPagination from './FileListPagination';
import FileCard from './FileCard';
import { useFileOperations } from '../hooks/useFileOperations';
import FileTable from './FileTable';
import { useNotification } from '../context/NotificationContext';
import { useTranslation } from 'react-i18next';

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

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  const [openDeleteFileDialog, setOpenDeleteFileDialog] = useState<boolean>(false);

  const { accessToken } = useAuth();
  const { fetchFilesList, deleteFile } = useFileOperations();
  const { showNotification } = useNotification();
  const { t } = useTranslation();
  const [emptyNotificationShown, setEmptyNotificationShown] = useState(false);
  
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

  useEffect(() => {
    if (!fileListResponse) return;

    if (fileListResponse.totalItems === 0) {
      if (!emptyNotificationShown) {
        showNotification(
          filters.searchQuery
            ? t('fileList.empty.noItemsFiltered')
            : t('fileList.empty.noItems'),
          'error'
        );
        setEmptyNotificationShown(true);
      }
    } else if (emptyNotificationShown) {
      setEmptyNotificationShown(false);
    }
  }, [fileListResponse?.totalItems, filters.searchQuery, showNotification, t, emptyNotificationShown]);

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

  const handleCloseVideoDialog = () => {
    setOpenVideoDialog(false);
    setSelectedFile(null);
  };

  const handleCloseDocumentDialog = () => {
    setOpenDocumentDialog(false);
    setSelectedFile(null);
  };

  const handleCloseImageDialog = () => {
    setOpenImageDialog(false);
    setSelectedFile(null);
  };

  const handleCloseDeleteFileDialog = () => {
    setOpenDeleteFileDialog(false);
    setSelectedFile(null);
  };

  const isSharedFile = (file: FileMetadata) => {
    if (!accessToken) return false;
    const currentUserId = decodeUserId(accessToken);
    if (!currentUserId) return false;

    return file.userId !== currentUserId;
  };

  return (
    <Box
      sx={{
        paddingTop: '24px',
        paddingBottom: '0px',
        px: isMobile ? '16px' : '24px',
      }}
    >
      {selectedFile && openVideoDialog && (
        <VideoDialog
          open={openVideoDialog}
          onClose={handleCloseVideoDialog}
          file={selectedFile}
          isShared={isSelectedFileShared}
        />
      )}

      {selectedFile && openDocumentDialog && (
        <DocumentDialog
          open={openDocumentDialog}
          onClose={handleCloseDocumentDialog}
          file={selectedFile}
          isShared={isSelectedFileShared}
        />
      )}

      {selectedFile && openImageDialog && (
        <ImageDialog
          open={openImageDialog}
          onClose={handleCloseImageDialog}
          file={selectedFile}
          isShared={isSelectedFileShared}
        />
      )}

      {selectedFile && openDeleteFileDialog && (
        <DeleteFileDialog
          open={openDeleteFileDialog}
          onClose={handleCloseDeleteFileDialog}
          onConfirm={handleDeleteFile}
          file={selectedFile}
        />
      )}
      
      <FileListToolbar
        onFiltersChange={handleFiltersChange}
      />

      {totalItems > 0 && (filters.viewMode === 'grid' || !isDesktop) ? (
        <Box sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '24px',
          maxWidth: '1200px',
          margin: '0 auto',
        }}>
        {files.map((file) => {
          const isShared = isSharedFile(file);

          return (
            <Box
              key={file.id}
              sx={{
              display: 'flex',
              justifyContent: 'center',
                width: {
                  xs: '100%',                
                  md: 'calc((100% - 24px) / 2)',               
                  lg: 'calc((100% - 48px) / 3)',
                },
                maxWidth: {
                  xs: '100%',
                  md: '400px',
                  lg: '320px',
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
      ) : totalItems > 0 && isDesktop ? (
        <FileTable
          files={files}
          isSharedFile={isSharedFile}
          onFileClick={handleFileClick}
          onDeleteDialogOpen={handleOpenDeleteDialog}
        />
      ) : null}

      {totalItems === 0 && (
        <Box sx={{ marginTop: '16px' }}>
          <Typography
            align="center"
            sx={{
              fontWeight: '600',
              color: filters.searchQuery ? 'error.main' : 'text.secondary',
            }}
          >
            {filters.searchQuery
              ? t('fileList.empty.noItemsFiltered')
              : t('fileList.empty.noItems')}
          </Typography>
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