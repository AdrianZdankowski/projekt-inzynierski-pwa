import { useState, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react';
import { Card, CardContent, CardActions, Typography, IconButton, Button, Box, Chip, 
  Alert, Tooltip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Menu,
  MenuItem, Select, FormControl, TextField } from '@mui/material';
import { Delete as DeleteIcon, Share as ShareIcon, CloudDone as SharedIcon, ViewModule as GridViewIcon,
  ViewList as ListViewIcon, Sort as SortIcon, ArrowUpward as ArrowUpIcon, ArrowDownward as ArrowDownIcon,
  KeyboardArrowLeft as ArrowLeftIcon, KeyboardArrowRight as ArrowRightIcon,
  Search as SearchIcon } from '@mui/icons-material';
import { FileService } from '../services/FileService';
import { FileMetadata } from '../types/FileMetadata';
import { getFileIcon, getFileTypeColor, formatFileSize, formatDate } from '../utils/fileUtils';
import { useAuth } from '../context/AuthContext';
import { decodeUserId } from '../lib/decodeUserId';
import { PaginationControlBox } from '../themes/boxes/PaginationControlBox';
import { ToolbarBox } from '../themes/boxes/ToolbarBox';
import { MenuItemBox } from '../themes/boxes/MenuItemBox';
import { MenuItemContainerBox } from '../themes/boxes/MenuItemContainerBox';
import { UserIconBox } from '../themes/boxes/UserIconBox';
import { CardBox } from '../themes/boxes/CardBox';
import { FileTypeBox } from '../themes/boxes/FileTypeBox';
import { useNavigate } from 'react-router-dom';

const SORT_OPTIONS = [
  { field: 'fileName', label: 'Nazwa' },
  { field: 'size', label: 'Rozmiar' },
  { field: 'uploadTimestamp', label: 'Data dodania' },
  { field: 'ownerName', label: 'Właściciel' }
] as const;

export interface FileListRef {
  refreshFiles: () => void;
}

type ViewMode = 'grid' | 'list';
type SortField = 'fileName' | 'size' | 'uploadTimestamp' | 'ownerName';
type SortOrder = 'asc' | 'desc';

const FileList = forwardRef<FileListRef>((_, ref) => {
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortField, setSortField] = useState<SortField>('fileName');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [sortMenuAnchor, setSortMenuAnchor] = useState<null | HTMLElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const { accessToken } = useAuth();
  const navigate = useNavigate();

  const fetchFiles = useCallback(async () => {
    try {
      const userFiles = await FileService.getUserFiles();
      setFiles(userFiles);
      setError(null); // Clear any previous errors on success
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError('Wymagana autoryzacja. Zaloguj się ponownie.');
      } else if (err.response?.status === 403) {
        setError('Odmowa dostępu. Nie masz uprawnień do przeglądania plików.');
      } else {
        setError('Nie udało się załadować plików. Spróbuj ponownie.');
      }
      console.error('Error fetching files:', err);
    }
  }, []);
  
  useEffect(() => {
    fetchFiles();
  }, []);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleSortMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setSortMenuAnchor(event.currentTarget);
  };

  const handleSortMenuClose = () => {
    setSortMenuAnchor(null);
  };

  // Filter files by search query
  const filteredFiles = files.filter(file => 
    file.fileName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedFiles = [...filteredFiles].sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortField) {
      case 'fileName':
        aValue = a.fileName.toLowerCase();
        bValue = b.fileName.toLowerCase();
        break;
      case 'size':
        aValue = a.size;
        bValue = b.size;
        break;
      case 'uploadTimestamp':
        aValue = new Date(a.uploadTimestamp);
        bValue = new Date(b.uploadTimestamp);
        break;
      case 'ownerName':
        aValue = a.ownerName.toLowerCase();
        bValue = b.ownerName.toLowerCase();
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedFiles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedFiles = sortedFiles.slice(startIndex, endIndex);

  // Reset to first page when items per page changes
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  // Reset to first page when files change or search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [files.length, searchQuery]);

  // Expose refresh function to parent via ref
  useImperativeHandle(ref, () => ({
    refreshFiles: fetchFiles
  }));

  const handleDeleteFile = async (fileId: string) => {
    try {
      // TODO: Implement endpoint in backend
      console.log('Delete file:', fileId);
    } catch (err) {
      console.error('Error deleting file:', err);
    }
  };

  const handleShareFile = async (fileId: string) => {
    try {
      // TODO: Implement endpoint in backend
      console.log('Share file:', fileId);
    } catch (err) {
      console.error('Error sharing file:', err);
    }
  };

  const handleFileClick = (file: FileMetadata, isShared: boolean) => {
    // TODO: Implement functionality in the future
    console.log('Open file:', file);

    // Open video page
    switch(file.mimeType) {
      case 'video/mp4':
        navigate('/video', {state: {file, isShared}});
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

  if (error) {
    return (
      <Alert severity="error" sx={{ margin: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ padding: 3 }}>
      {/* Toolbar - only show if user has files */}
      {files.length > 0 && (
        <ToolbarBox>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'white' }}>
            Pliki ({startIndex + 1}-{Math.min(endIndex, sortedFiles.length)} z {sortedFiles.length})
            {searchQuery && ` (z ${files.length} wszystkich)`}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {/* Search Input */}
            <TextField
              size="small"
              placeholder="Szukaj plików..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: 'rgba(255, 255, 255, 0.7)', mr: 1 }} />,
              }}
            />

            {/* Sort Menu */}
            <Tooltip title="Sortuj">
              <IconButton onClick={handleSortMenuOpen} size="small" sx={{ color: 'white' }}>
                <SortIcon />
              </IconButton>
            </Tooltip>
          
            <Menu
              anchorEl={sortMenuAnchor}
              open={Boolean(sortMenuAnchor)}
              onClose={handleSortMenuClose}
              PaperProps={{
                className: 'sort-menu'
              }}
              transformOrigin={{ horizontal: 'left', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
            >
              {SORT_OPTIONS.map(({ field, label }) => (
                <MenuItem 
                  key={field}
                  onClick={() => handleSort(field as any)} 
                  className={`sort-menu-item ${sortField === field ? 'active' : ''}`}
                >
                  <MenuItemContainerBox>
                    <MenuItemBox sx={{ backgroundColor: sortField === field ? '#2e7d32' : 'transparent' }}>
                      {sortField === field && (sortOrder === 'asc' ? <ArrowUpIcon sx={{ fontSize: 14 }} /> : <ArrowDownIcon sx={{ fontSize: 14 }} />)}
                    </MenuItemBox>
                    <Typography 
                      className={`sort-menu-text ${sortField === field ? 'active' : ''}`}
                    >
                      {label}
                    </Typography>
                  </MenuItemContainerBox>
                </MenuItem>
              ))}
            </Menu>

            {/* View Toggle */}
            <Tooltip title={viewMode === 'grid' ? 'Widok listy' : 'Widok kafelków'}>
              <IconButton 
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                size="small"
                sx={{ color: 'white' }}
              >
                {viewMode === 'grid' ? <ListViewIcon /> : <GridViewIcon />}
              </IconButton>
            </Tooltip>
          </Box>
        </ToolbarBox>
      )}

      {files.length > 0 && viewMode === 'grid' ? (
        <CardBox>
        {paginatedFiles.map((file) => {
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
                    handleDeleteFile(file.id);
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
      ) : files.length > 0 && paginatedFiles.length > 0 ? (
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
              {paginatedFiles.map((file, index) => {
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
                              handleDeleteFile(file.id);
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

      {sortedFiles.length === 0 && (
        <Box sx={{ marginTop: 4 }}>
          <Alert 
            severity="info" 
            className="empty-files-alert"
          >
            <Typography className="alert-title">
              {files.length === 0 ? 'Nie masz żadnych plików obecnie' : 'Nie znaleziono plików'}
            </Typography>
            <Typography className="alert-subtitle">
              {files.length === 0 ? 'Prześlij pliki, aby rozpocząć korzystanie z aplikacji' : 'Spróbuj zmienić kryteria wyszukiwania'}
            </Typography>
          </Alert>
        </Box>
      )}

      {/* Pagination Controls */}
      {sortedFiles.length > 0 && (
        <PaginationControlBox>
          {/* Left spacer */}
          <Box sx={{ width: 80 }} />
          
          {/* Center pagination - only show if more than 1 page */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {/* Previous Page Button */}
              <IconButton
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`pagination-nav ${currentPage === 1 ? 'disabled' : ''}`}
              >
                <ArrowLeftIcon />
              </IconButton>

                {/* Page Numbers */}
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    // Show first page, last page, current page, and pages around current page
                    const shouldShow = 
                      page === 1 || 
                      page === totalPages || 
                      Math.abs(page - currentPage) <= 1;
                    
                    if (!shouldShow) {
                      // Show ellipsis for gaps
                      if (page === 2 && currentPage > 4) {
                        return <Typography key={`ellipsis-${page}`} sx={{ px: 1 }}>...</Typography>;
                      }
                      if (page === totalPages - 1 && currentPage < totalPages - 3) {
                        return <Typography key={`ellipsis-${page}`} sx={{ px: 1 }}>...</Typography>;
                      }
                      return null;
                    }

                  return (
                    <Button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      variant={currentPage === page ? 'contained' : 'outlined'}
                      size="small"
                      className={currentPage === page ? 'pagination-active' : 'pagination-inactive'}
                    >
                      {page}
                    </Button>
                  );
                  })}
                </Box>

              {/* Next Page Button */}
              <IconButton
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`pagination-nav ${currentPage === totalPages ? 'disabled' : ''}`}
              >
                <ArrowRightIcon />
              </IconButton>
              </Box>
            )}

          {/* Items per page selector - Always visible on the right */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FormControl size="small" sx={{ minWidth: 80 }}>
                <Select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}>
                <MenuItem value={5}>5</MenuItem>
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={15}>15</MenuItem>
                <MenuItem value={20}>20</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </PaginationControlBox>
      )}
    </Box>
  );
});

export default FileList;