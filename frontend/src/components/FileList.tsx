import { useState, useEffect, useCallback } from 'react';
import { Box, Typography, useMediaQuery, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { FileListResponse, FileListParams, FileListFilters, FileListPaginationState } from '../types/FileListTypes';
import { FileMetadata } from '../types/FileMetadata';
import { useAuth } from '../context/AuthContext';
import { decodeUserId } from '../utils/decodeUserId';
import VideoDialog from './VideoDialog';
import DocumentDialog from './DocumentDialog';
import ImageDialog from './ImageDialog';
import DeleteFileDialog from './DeleteFileDialog';
import ShareDialog from './ShareDialog';
import FileListToolbar from './FileListToolbar';
import FileListPagination from './FileListPagination';
import FileCard from './FileCard';
import { useFileOperations } from '../hooks/useFileOperations';
import { useFolderOperations } from '../hooks/useFolderOperations';
import FileTable from './FileTable';
import CreateFolderDialog from './CreateFolderDialog';
import { CreateNewFolder as CreateNewFolderIcon } from '@mui/icons-material';
import { useNotification } from '../context/NotificationContext';
import { useTranslation } from 'react-i18next';
import FileBreadcrumbs from './FileBreadcrumbs';

interface FileListProps {
  onRefreshReady?: (refreshFn: () => void) => void;
  onFolderChange?: (folderId: string | null, canAdd?: boolean) => void;
}

const FileList = ({ onRefreshReady, onFolderChange }: FileListProps) => {
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
  const [openVideoDialog, setOpenVideoDialog] = useState<boolean>(false);
  const [openDocumentDialog, setOpenDocumentDialog] = useState<boolean>(false);
  const [openImageDialog, setOpenImageDialog] = useState<boolean>(false);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<{ id: string | null; name: string }[]>([]);
  const [isCreateFolderDialogOpen, setIsCreateFolderDialogOpen] = useState<boolean>(false);
  const [openShareDialog, setOpenShareDialog] = useState<boolean>(false);
  const [shareItemId, setShareItemId] = useState<string>('');
  const [shareItemType, setShareItemType] = useState<'file' | 'folder'>('file');

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  const [openDeleteFileDialog, setOpenDeleteFileDialog] = useState<boolean>(false);

  const { accessToken } = useAuth();
  const { fetchFilesList, deleteFile } = useFileOperations();
  const { deleteFolder } = useFolderOperations();
  const { showNotification } = useNotification();
  const { t } = useTranslation();
  const [emptyNotificationShown, setEmptyNotificationShown] = useState(false);

  useEffect(() => {
    setBreadcrumbs([{ id: null, name: '' }]);
  }, []);
  
  const fetchFiles = useCallback(async () => {
    const params: FileListParams = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      sortBy: filters.sortField,
      sortDirection: filters.sortOrder,
      q: filters.searchQuery || undefined,
      folderId: currentFolderId || undefined,
    };
    
    const response = await fetchFilesList(params);
    if (response) {
      setFileListResponse(response);
    }
  }, [pagination, filters, fetchFilesList, currentFolderId]);
  
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
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  useEffect(() => {
    const newPageSize = isMobile ? 5 : 10;
    setPagination(prev => {
      if (prev.pageSize !== newPageSize) {
        return { ...prev, pageSize: newPageSize, page: 1 };
      }
      return prev;
    });
  }, [isMobile]);

  const handlePaginationChange = useCallback((page: number, itemsPerPage: number) => {
    setPagination(prev => ({ ...prev, page, pageSize: itemsPerPage }));
  }, []);

  const files = fileListResponse?.items || [];
  const totalItems = fileListResponse?.totalItems || 0;

  useEffect(() => {
    if (onRefreshReady) {
      onRefreshReady(fetchFiles);
    }
  }, [onRefreshReady, fetchFiles]);

  useEffect(() => {
    if (onFolderChange) {
      const canAdd = currentFolderId === null ? true : (fileListResponse?.canAddToFolder ?? true);
      onFolderChange(currentFolderId, canAdd);
    }
  }, [currentFolderId, fileListResponse?.canAddToFolder, onFolderChange]);

  const handleDeleteFile = async (fileId: string) => {
    const isFolder = selectedFile?.id === fileId && selectedFile.type === 'folder';
    const wasLastItemOnPage = files.length === 1;

    const success = isFolder
      ? await deleteFolder(fileId)
      : await deleteFile(fileId);

    if (!success) return;

    setFileListResponse(prev => {
      if (!prev) return prev;
      const newItems = prev.items.filter(f => f.id !== fileId);
      const newTotal = Math.max((prev.totalItems ?? 0) - 1, 0);
      return {
        ...prev,
        items: newItems,
        totalItems: newTotal,
      };
    });

    if (wasLastItemOnPage && pagination.page > 1) {
      setPagination(prev => ({ ...prev, page: 1 }));
    }
  };
 
  const handleFileClick = (file: FileMetadata) => {
    console.log('Open file:', file);

    if (file.type === 'folder') {
      setCurrentFolderId(file.id);
      setPagination(prev => ({ ...prev, page: 1 }));
      setBreadcrumbs(prev => [...prev, { id: file.id, name: file.name }]);
      return;
    }

    setSelectedFile(file);

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

  const handleOpenShareDialog = (file: FileMetadata) => {
    setShareItemId(file.id);
    setShareItemType(file.type as 'file' | 'folder');
    setOpenShareDialog(true);
  };

  const handleCloseShareDialog = () => {
    setOpenShareDialog(false);
    setShareItemId('');
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

  const handleOpenCreateFolderDialog = () => {
    setIsCreateFolderDialogOpen(true);
  };

  const handleCloseCreateFolderDialog = () => {
    setIsCreateFolderDialogOpen(false);
  };

  const handleBreadcrumbClick = (index: number) => {
    const target = breadcrumbs[index];
    setBreadcrumbs(prev => prev.slice(0, index + 1));
    setCurrentFolderId(target.id);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  return (
    <Box
      sx={{
        paddingTop: '18px',
        paddingBottom: '0px',
        px: isMobile ? '16px' : '24px',
      }}
    >
      {breadcrumbs.length > 0 && (
        <>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: '8px',
              px: isMobile ? '4px' : '0px',
              gap: '8px',
              flexWrap: 'wrap',
            }}
          >
            <FileBreadcrumbs
              items={breadcrumbs}
              onBreadcrumbClick={handleBreadcrumbClick}
            />

            <Button
              variant="outlined"
              startIcon={<CreateNewFolderIcon />}
              onClick={handleOpenCreateFolderDialog}
              sx={{
                fontSize: '0.85rem',
                padding: isMobile ? '6px' : '8px 24px',
                minWidth: isMobile ? '44px' : 'auto',
                borderRadius: '12px',
                fontWeight: '700',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: isMobile ? 'center' : 'flex-start',
                '& .MuiButton-startIcon': {
                  marginLeft: isMobile ? '6px' : '0px',
                  marginBottom: isMobile ? '0px' : '2px',
                },
              }}
            >
              {!isMobile && t('fileList.createFolder.button')}
            </Button>
          </Box>
        </>
      )}
      {selectedFile && openVideoDialog && (
        <VideoDialog
          open={openVideoDialog}
          onClose={handleCloseVideoDialog}
          file={selectedFile}
        />
      )}

      {selectedFile && openDocumentDialog && (
        <DocumentDialog
          open={openDocumentDialog}
          onClose={handleCloseDocumentDialog}
          file={selectedFile}
        />
      )}

      {selectedFile && openImageDialog && (
        <ImageDialog
          open={openImageDialog}
          onClose={handleCloseImageDialog}
          file={selectedFile}
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

      {isCreateFolderDialogOpen && (
        <CreateFolderDialog
          open={isCreateFolderDialogOpen}
          onClose={handleCloseCreateFolderDialog}
          parentFolderId={currentFolderId}
          onFolderCreated={fetchFiles}
        />
      )}

      {openShareDialog && shareItemId && (
        <ShareDialog
          open={openShareDialog}
          onClose={handleCloseShareDialog}
          itemId={shareItemId}
          itemType={shareItemType}
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
          gap: '16px',
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
                canDeleteFromFolder={fileListResponse?.canDeleteFromFolder}
                onFileClick={handleFileClick}
                onDeleteDialogOpen={handleOpenDeleteDialog}
                onShareDialogOpen={handleOpenShareDialog}
              />
            </Box>
          );
        })}
        </Box>
      ) : totalItems > 0 && isDesktop ? (
        <FileTable
          files={files}
          isSharedFile={isSharedFile}
          canDeleteFromFolder={fileListResponse?.canDeleteFromFolder}
          onFileClick={handleFileClick}
          onDeleteDialogOpen={handleOpenDeleteDialog}
          onShareDialogOpen={handleOpenShareDialog}
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
        page={pagination.page}
        pageSize={pagination.pageSize}
        onPaginationChange={handlePaginationChange}
      />
    </Box>
  );
};

export default FileList;