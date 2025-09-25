
import { useState, useEffect, forwardRef, useImperativeHandle, useCallback, useRef } from 'react';
import { Card, CardContent, CardActions, Typography, IconButton, Button, Box, Chip, CircularProgress,
  Alert, Tooltip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Menu,
  MenuItem, Select, FormControl, TextField } from '@mui/material';
import { Delete as DeleteIcon, Share as ShareIcon, CloudDone as SharedIcon, ViewModule as GridViewIcon,
  ViewList as ListViewIcon, Sort as SortIcon, ArrowUpward as ArrowUpIcon, ArrowDownward as ArrowDownIcon,
  KeyboardArrowLeft as ArrowLeftIcon, KeyboardArrowRight as ArrowRightIcon,
  Search as SearchIcon } from '@mui/icons-material';
import { FileService, FileMetadata } from '../services/FileService';
import { getFileIcon, getFileTypeColor, formatFileSize, formatDate } from '../utils/fileUtils';
import { useAuth } from '../context/AuthContext';
import { decodeUserId } from '../lib/decodeUserId';
import { useAxiosInterceptor } from '../hooks/useAxiosInterceptor';
import { PaginationControlBox } from '../themes/boxes/PaginationControlBox';
import { ToolbarBox } from '../themes/boxes/ToolbarBox';
import { MenuItemBox } from '../themes/boxes/MenuItemBox';
import { MenuItemContainerBox } from '../themes/boxes/MenuItemContainerBox';

export interface FileListRef {
  refreshFiles: () => void;
}

type ViewMode = 'grid' | 'list';
type SortField = 'fileName' | 'size' | 'uploadTimestamp' | 'ownerName';
type SortOrder = 'asc' | 'desc';

const FileList = forwardRef<FileListRef>((_, ref) => {
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortField, setSortField] = useState<SortField>('fileName');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [sortMenuAnchor, setSortMenuAnchor] = useState<null | HTMLElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const { accessToken, isRefreshing } = useAuth();
  const hasFetched = useRef(false);


  useAxiosInterceptor();
  
  const fetchFiles = useCallback(async () => {
    try {
      setLoading(true);
      const userFiles = await FileService.getUserFiles();
      setFiles(userFiles);
      setError(null); // Clear any previous errors on success
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError('Authentication required. Please log in again.');
      } else if (err.response?.status === 403) {
        setError('Access denied. You do not have permission to view files.');
      } else {
        setError('Failed to load files. Please try again.');
      }
      console.error('Error fetching files:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    hasFetched.current = false;
  }, [accessToken]);

  useEffect(() => {
    if (isRefreshing) return;
    if (!accessToken) return;
    if (hasFetched.current) return;
  
    hasFetched.current = true;
    fetchFiles();
  }, [accessToken, isRefreshing, fetchFiles]);

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

  const handleFileClick = (file: FileMetadata) => {
    // TODO: Implement functionality in the future
    console.log('Open file:', file);
  };

  const isSharedFile = (file: FileMetadata) => {
    if (!accessToken) return false;
    const currentUserId = decodeUserId(accessToken);
    if (!currentUserId) return false;
    // File is shared if the owner is different from current user
    return file.userId !== currentUserId;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

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
            <MenuItem 
              onClick={() => handleSort('fileName')} 
              className={`sort-menu-item ${sortField === 'fileName' ? 'active' : ''}`}
            >
              <MenuItemContainerBox>
                <MenuItemBox sx={{ backgroundColor: sortField === 'fileName' ? '#2e7d32' : 'transparent' }}>
                  {sortField === 'fileName' && (sortOrder === 'asc' ? <ArrowUpIcon sx={{ fontSize: 14 }} /> : <ArrowDownIcon sx={{ fontSize: 14 }} />)}
                </MenuItemBox>
                <Typography 
                  className={`sort-menu-text ${sortField === 'fileName' ? 'active' : ''}`}
                >
                  Nazwa
                </Typography>
              </MenuItemContainerBox>
            </MenuItem>
            <MenuItem 
              onClick={() => handleSort('size')} 
              className={`sort-menu-item ${sortField === 'size' ? 'active' : ''}`}
            >
              <MenuItemContainerBox>
                <MenuItemBox sx={{ backgroundColor: sortField === 'size' ? '#2e7d32' : 'transparent' }}>
                  {sortField === 'size' && (sortOrder === 'asc' ? <ArrowUpIcon sx={{ fontSize: 14 }} /> : <ArrowDownIcon sx={{ fontSize: 14 }} />)}
                </MenuItemBox>
                <Typography 
                  className={`sort-menu-text ${sortField === 'size' ? 'active' : ''}`}
                >
                  Rozmiar
                </Typography>
              </MenuItemContainerBox>
            </MenuItem>
            <MenuItem 
              onClick={() => handleSort('uploadTimestamp')} 
              className={`sort-menu-item ${sortField === 'uploadTimestamp' ? 'active' : ''}`}
            >
              <MenuItemContainerBox>
                <MenuItemBox sx={{ backgroundColor: sortField === 'uploadTimestamp' ? '#2e7d32' : 'transparent' }}>
                  {sortField === 'uploadTimestamp' && (sortOrder === 'asc' ? <ArrowUpIcon sx={{ fontSize: 14 }} /> : <ArrowDownIcon sx={{ fontSize: 14 }} />)}
                </MenuItemBox>
                <Typography 
                  className={`sort-menu-text ${sortField === 'uploadTimestamp' ? 'active' : ''}`}
                >
                  Data dodania
                </Typography>
              </MenuItemContainerBox>
            </MenuItem>
            <MenuItem 
              onClick={() => handleSort('ownerName')} 
              className={`sort-menu-item ${sortField === 'ownerName' ? 'active' : ''}`}
            >
              <MenuItemContainerBox>
                <MenuItemBox sx={{ backgroundColor: sortField === 'ownerName' ? '#2e7d32' : 'transparent' }}>
                  {sortField === 'ownerName' && (sortOrder === 'asc' ? <ArrowUpIcon sx={{ fontSize: 14 }} /> : <ArrowDownIcon sx={{ fontSize: 14 }} />)}
                </MenuItemBox>
                <Typography 
                  className={`sort-menu-text ${sortField === 'ownerName' ? 'active' : ''}`}
                >
                  Właściciel
                </Typography>
              </MenuItemContainerBox>
            </MenuItem>
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
        <Box 
          sx={{ 
            display: 'flex',
            flexWrap: 'wrap',
            gap: 3,
            justifyContent: 'center',
            maxWidth: '1000px',
            margin: '0 auto',
            backgroundColor: 'linear-gradient(135deg, #ffffff, #f0f7ff)',
          }}
        >
        {paginatedFiles.map((file, index) => {
          const FileIcon = getFileIcon(file.mimeType);
          const fileColor = getFileTypeColor(file.mimeType);
          const isShared = isSharedFile(file);
          const isEvenRow = index % 2 === 0;

          return (
            <Box key={file.id}>
              <Card
                sx={{
                  height: '280px',
                  width: '280px',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  background: isEvenRow ? '#ffffff' : '#f8f9fa',
                  color: '#000000',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                    background: isEvenRow ? '#f0f0f0' : '#e8e8e8'
                  },
                  position: 'relative',
                  margin: '0 auto'
                }}
                onClick={() => handleFileClick(file)}
              >
                {/* Delete button in top-right corner */}
                <IconButton
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    zIndex: 1,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.7)'
                    }
                  }}
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
                    sx={{
                      position: 'absolute',
                      top: 8,
                      left: 8,
                      zIndex: 1,
                      backgroundColor: '#4CAF50',
                      color: 'white'
                    }}
                  />
                )}

                <CardContent sx={{ 
                  flexGrow: 1, 
                  textAlign: 'center', 
                  padding: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  height: '100%'
                }}>
                  {/* File type icon */}
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    height: '80px',
                    marginTop: 1
                  }}>
                    <FileIcon
                      sx={{
                        fontSize: 64,
                        color: fileColor
                      }}
                    />
                  </Box>

                  {/* File name */}
                  <Typography
                    variant="body2"
                    component="div"
                    sx={{
                      fontWeight: 'bold',
                      marginBottom: 0.5,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      fontSize: '0.9rem',
                      color: '#000000'
                    }}
                    title={file.fileName}
                  >
                    {file.fileName}
                  </Typography>

                  {/* File size and date */}
                  <Box sx={{ marginBottom: 1 }}>
                    <Typography variant="body2" sx={{ fontSize: '0.8rem', marginBottom: 0.2, color: 'rgba(0, 0, 0, 0.7)' }}>
                      {formatFileSize(file.size)}
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.75rem', color: 'rgba(0, 0, 0, 0.7)' }}>
                      {formatDate(file.uploadTimestamp)}
                    </Typography>
                  </Box>
                </CardContent>

                <CardActions sx={{ 
                  justifyContent: 'center', 
                  padding: 1,
                  paddingTop: 0,
                  minHeight: 'auto'
                }}>
                  <Tooltip title="Udostępnij plik">
                    <Button
                      variant="outlined"
                      startIcon={<ShareIcon />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShareFile(file.id);
                      }}
                      size="small"
                      sx={{
                        fontSize: '0.75rem',
                        padding: '4px 8px',
                        minWidth: 'auto',
                        borderColor: '#1976d2',
                        color: '#1976d2',
                        borderRadius: 12,
                        '&:hover': {
                          borderColor: '#1976d2',
                          backgroundColor: 'rgba(117, 117, 117, 0.1)'
                        }
                      }}
                    >
                      UDOSTĘPNIJ
                    </Button>
                  </Tooltip>
                </CardActions>
              </Card>
            </Box>
          );
        })}
        </Box>
      ) : files.length > 0 ? (
        /* List View */
        <TableContainer 
          component={Paper} 
          sx={{ 
            maxWidth: '100%', 
            margin: '0 auto',
            boxShadow: 2,
            borderRadius: 2,
            overflow: 'hidden'
          }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Nazwa</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '0.9rem', textAlign: 'center' }}>Właściciel</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '0.9rem', textAlign: 'center' }}>Data modyfikacji</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '0.9rem', textAlign: 'center' }}>Rozmiar pliku</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Akcje</TableCell>
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
                    sx={{ 
                      cursor: 'pointer',
                      backgroundColor: isEvenRow ? '#ffffff' : '#f8f9fa',
                      '&:hover': {
                        backgroundColor: isEvenRow ? '#f0f0f0' : '#e8e8e8'
                      }
                    }}
                    onClick={() => handleFileClick(file)}
                  >
                    <TableCell sx={{ py: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <FileIcon sx={{ color: fileColor, fontSize: 24 }} />
                        {isShared && <SharedIcon sx={{ fontSize: 18, color: '#4CAF50' }} />}
                        <Typography variant="body2" sx={{ fontWeight: 'medium', fontSize: '0.9rem', color: '#000000', lineHeight: 1, mt: 0.3 }}>
                          {file.fileName}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 1.5, textAlign: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            backgroundColor: '#2e7d32',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.85rem',
                            fontWeight: 'bold'
                          }}
                        >
                          {file.ownerName.charAt(0).toUpperCase()}
                        </Box>
                        <Typography variant="body2" sx={{ fontSize: '0.9rem', color: '#000000', lineHeight: 1, mt: 0.3 }}>
                          {file.ownerName}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 1.5, textAlign: 'center' }}>
                      <Typography variant="body2" sx={{ fontSize: '0.9rem', color: '#000000', lineHeight: 1, mt: 0.3 }}>
                        {formatDate(file.uploadTimestamp)}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 1.5, textAlign: 'center' }}>
                      <Typography variant="body2" sx={{ fontSize: '0.9rem', color: '#000000', lineHeight: 1, mt: 0.3 }}>
                        {formatFileSize(file.size)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center" sx={{ py: 2 }}>
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <Tooltip title="Udostępnij">
                          <IconButton
                            size="small"
                            sx={{ 
                              color: '#1976d2',
                              '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.1)' }
                            }}
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
                            sx={{ 
                              color: '#757575',
                              '&:hover': { backgroundColor: 'rgba(117, 117, 117, 0.1)' }
                            }}
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
            sx={{ 
              margin: 'auto',
              maxWidth: '800px',
              '& .MuiAlert-message': {
                width: '100%',
                textAlign: 'center',
                alignItems: 'center'
              }
            }}
          >
            <Typography variant="h6" sx={{ marginBottom: 1, fontWeight: 'bold', color: 'blue', textAlign: 'center' }}>
              {files.length === 0 ? 'Nie masz żadnych plików obecnie' : 'Nie znaleziono plików'}
            </Typography>
            <Typography variant="body2" sx={{ marginBottom: 1, color: 'blue', textAlign: 'center' }}>
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