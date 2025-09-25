
import { useState, useEffect, forwardRef, useImperativeHandle, useCallback, useRef } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Button,
  Box,
  Chip,
  CircularProgress,
  Alert,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Menu,
  MenuItem,
  Select,
  FormControl,
  TextField
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Share as ShareIcon,
  CloudDone as SharedIcon,
  ViewModule as GridViewIcon,
  ViewList as ListViewIcon,
  Sort as SortIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  KeyboardArrowLeft as ArrowLeftIcon,
  KeyboardArrowRight as ArrowRightIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { FileService, FileMetadata } from '../services/FileService';
import { getFileIcon, getFileTypeColor, formatFileSize, formatDate } from '../utils/fileUtils';
import { useAuth } from '../context/AuthContext';
import { decodeUserId } from '../lib/decodeUserId';
import { useAxiosInterceptor } from '../hooks/useAxiosInterceptor';

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
    // Reset flag gdy accessToken się zmienia
    hasFetched.current = false;
  }, [accessToken]);

  useEffect(() => {
    if (isRefreshing) return; // czekaj aż restoreSession zakończy
    if (!accessToken) return; // brak tokena, nie fetchuj
    if (hasFetched.current) return; // już fetchowaliśmy
  
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
    // Don't close the menu - keep it open
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

  // Pagination logic
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
      // TODO: Implement delete endpoint in backend
      console.log('Delete file:', fileId);
      // await FileService.deleteFile(fileId);
      // setFiles(files.filter(file => file.id !== fileId));
    } catch (err) {
      console.error('Error deleting file:', err);
    }
  };

  const handleShareFile = async (fileId: string) => {
    try {
      // For now, just show a placeholder - this would need user selection
      console.log('Share file:', fileId);
      // await FileService.shareFile(fileId, userId);
    } catch (err) {
      console.error('Error sharing file:', err);
    }
  };

  const handleFileClick = (file: FileMetadata) => {
    // Placeholder for file opening functionality
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
      {/* Toolbar */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 3,
        padding: '0 20px'
      }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
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
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: 'rgba(255, 255, 255, 0.7)', mr: 1 }} />,
            }}
            sx={{
              minWidth: 200,
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'white',
                },
              },
              '& .MuiInputBase-input::placeholder': {
                color: 'rgba(255, 255, 255, 0.7)',
                opacity: 1,
              },
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
              sx: {
                minWidth: 180,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                border: 'none',
                borderRadius: 2,
                overflow: 'hidden',
                mt: 1
              }
            }}
            transformOrigin={{ horizontal: 'left', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
          >
            <MenuItem 
              onClick={() => handleSort('fileName')} 
              sx={{ 
                py: 1.2,
                px: 2,
                '&:hover': { backgroundColor: '#f5f5f5' },
                backgroundColor: sortField === 'fileName' ? '#e8f5e8' : 'transparent'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%', height: 30 }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  backgroundColor: sortField === 'fileName' ? '#2e7d32' : 'transparent',
                  color: 'white'
                }}>
                  {sortField === 'fileName' && (sortOrder === 'asc' ? <ArrowUpIcon sx={{ fontSize: 14 }} /> : <ArrowDownIcon sx={{ fontSize: 14 }} />)}
                </Box>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: sortField === 'fileName' ? 600 : 400,
                    color: sortField === 'fileName' ? '#2e7d32' : '#333',
                    fontSize: '0.9rem',
                    lineHeight: 1,
                    display: 'flex',
                    alignItems: 'center',
                    height: 20,
                    pb: 1.2
                  }}
                >
                  Nazwa
                </Typography>
              </Box>
            </MenuItem>
            <MenuItem 
              onClick={() => handleSort('size')} 
              sx={{ 
                py: 1.2,
                px: 2,
                '&:hover': { backgroundColor: '#f5f5f5' },
                backgroundColor: sortField === 'size' ? '#e8f5e8' : 'transparent'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%', height: 30 }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  backgroundColor: sortField === 'size' ? '#2e7d32' : 'transparent',
                  color: 'white'
                }}>
                  {sortField === 'size' && (sortOrder === 'asc' ? <ArrowUpIcon sx={{ fontSize: 14 }} /> : <ArrowDownIcon sx={{ fontSize: 14 }} />)}
                </Box>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: sortField === 'size' ? 600 : 400,
                    color: sortField === 'size' ? '#2e7d32' : '#333',
                    fontSize: '0.9rem',
                    lineHeight: 1,
                    display: 'flex',
                    alignItems: 'center',
                    height: 20,
                    pb: 1.2
                  }}
                >
                  Rozmiar
                </Typography>
              </Box>
            </MenuItem>
            <MenuItem 
              onClick={() => handleSort('uploadTimestamp')} 
              sx={{ 
                py: 1.2,
                px: 2,
                '&:hover': { backgroundColor: '#f5f5f5' },
                backgroundColor: sortField === 'uploadTimestamp' ? '#e8f5e8' : 'transparent'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%', height: 30 }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  backgroundColor: sortField === 'uploadTimestamp' ? '#2e7d32' : 'transparent',
                  color: 'white'
                }}>
                  {sortField === 'uploadTimestamp' && (sortOrder === 'asc' ? <ArrowUpIcon sx={{ fontSize: 14 }} /> : <ArrowDownIcon sx={{ fontSize: 14 }} />)}
                </Box>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: sortField === 'uploadTimestamp' ? 600 : 400,
                    color: sortField === 'uploadTimestamp' ? '#2e7d32' : '#333',
                    fontSize: '0.9rem',
                    lineHeight: 1,
                    display: 'flex',
                    alignItems: 'center',
                    height: 18,
                    pb: 1.2
                  }}
                >
                  Data dodania
                </Typography>
              </Box>
            </MenuItem>
            <MenuItem 
              onClick={() => handleSort('ownerName')} 
              sx={{ 
                py: 1.2,
                px: 2,
                '&:hover': { backgroundColor: '#f5f5f5' },
                backgroundColor: sortField === 'ownerName' ? '#e8f5e8' : 'transparent'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%', height: 30}}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  backgroundColor: sortField === 'ownerName' ? '#2e7d32' : 'transparent',
                  color: 'white'
                }}>
                  {sortField === 'ownerName' && (sortOrder === 'asc' ? <ArrowUpIcon sx={{ fontSize: 14 }} /> : <ArrowDownIcon sx={{ fontSize: 14 }} />)}
                </Box>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: sortField === 'ownerName' ? 600 : 400,
                    color: sortField === 'ownerName' ? '#2e7d32' : '#333',
                    fontSize: '0.9rem',
                    lineHeight: 1,
                    display: 'flex',
                    alignItems: 'center',
                    height: 20,
                    pb: 1.2
                  }}
                >
                  Właściciel
                </Typography>
              </Box>
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
      </Box>

      {viewMode === 'grid' ? (
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
      ) : (
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
      )}

      {sortedFiles.length === 0 && (
        <Box textAlign="center" sx={{ marginTop: 4 }}>
          <Typography variant="h6" color="text.secondary">
            {searchQuery ? 'Nie znaleziono plików' : 'Brak plików'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchQuery ? 'Spróbuj zmienić kryteria wyszukiwania' : 'Prześlij pliki, aby rozpocząć'}
          </Typography>
        </Box>
      )}

      {/* Pagination Controls */}
      {sortedFiles.length > 0 && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginTop: 4,
          gap: 2,
          padding: '20px 0'
        }}>
          {/* Left spacer */}
          <Box sx={{ width: 120 }} />
          
          {/* Center pagination - only show if more than 1 page */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {/* Previous Page Button */}
              <IconButton
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                sx={{
                  color: currentPage === 1 ? 'rgba(0, 0, 0, 0.26)' : '#2e7d32',
                  '&:hover': {
                    backgroundColor: currentPage === 1 ? 'transparent' : 'rgba(46, 125, 50, 0.1)'
                  }
                }}
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
                      sx={{
                        minWidth: 40,
                        height: 40,
                        borderRadius: '50%',
                        backgroundColor: currentPage === page ? '#2e7d32' : 'transparent',
                        color: currentPage === page ? 'white' : '#2e7d32',
                        borderColor: '#2e7d32',
                        '&:hover': {
                          backgroundColor: currentPage === page ? '#1b5e20' : 'rgba(46, 125, 50, 0.1)',
                          borderColor: '#2e7d32'
                        }
                      }}
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
                sx={{
                  color: currentPage === totalPages ? 'rgba(0, 0, 0, 0.26)' : '#2e7d32',
                  '&:hover': {
                    backgroundColor: currentPage === totalPages ? 'transparent' : 'rgba(46, 125, 50, 0.1)'
                  }
                }}
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
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  sx={{
                    color: 'white',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'white',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'white',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'white',
                    },
                    '& .MuiSvgIcon-root': {
                      color: 'white',
                    }
                  }}
              >
                <MenuItem value={5}>5</MenuItem>
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={15}>15</MenuItem>
                <MenuItem value={20}>20</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
      )}
    </Box>
  );
});

export default FileList;