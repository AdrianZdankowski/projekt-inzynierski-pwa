import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, TextField, IconButton, Tooltip, Menu, MenuItem, InputAdornment, useTheme, useMediaQuery } from '@mui/material';
import { Sort as SortIcon, ViewModule as GridViewIcon, ViewList as ListViewIcon,
  ArrowUpward as ArrowUpIcon, ArrowDownward as ArrowDownIcon, Search as SearchIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { SORT_OPTIONS, SortField, SortOrder, getSortLabel } from '../types/SortTypes';
import { ViewMode } from '../types/FilterTypes';
import { FileListFilters } from '../types/FileListTypes';

interface FileListToolbarProps {
  onFiltersChange: (filters: FileListFilters) => void;
}

const FileListToolbar = ({
  onFiltersChange
}: FileListToolbarProps) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [sortMenuAnchor, setSortMenuAnchor] = useState<null | HTMLElement>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortField, setSortField] = useState<SortField>('uploadTimestamp');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const notifyFiltersChange = useCallback((filters: FileListFilters) => {
    onFiltersChange(filters);
  }, [onFiltersChange]);

  useEffect(() => {
    notifyFiltersChange({
      searchQuery,
      sortField,
      sortOrder,
      viewMode
    });
  }, [searchQuery, sortField, sortOrder, viewMode, notifyFiltersChange]);


  const handleSortMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setSortMenuAnchor(event.currentTarget);
  };

  const handleSortMenuClose = (_event?: {}, reason?: string) => {
    if (reason !== 'menuItemClick') {
      setSortMenuAnchor(null);
    }
  };

  const handleSortClick = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleViewModeToggle = () => {
    setViewMode(viewMode === 'grid' ? 'list' : 'grid');
  };

  return (
    <Box sx={{
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '32px',
        padding: '0 20px'
    }}>
      <TextField
        size="small"
        placeholder={t('fileListToolbar.searchPlaceholder')}
        autoComplete='off'
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="search-input"
        sx={{
          width: isMobile ? '200px' : '300px',
        }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          },
        }}
      />

      <Box sx={{ 
        display: 'flex', 
        gap: '8px', 
        alignItems: 'center',
      }}>
          <Tooltip title={t('fileListToolbar.sort')}>
            <IconButton onClick={handleSortMenuOpen} size="small">
              <SortIcon />
            </IconButton>
          </Tooltip>
        
          <Menu
            anchorEl={sortMenuAnchor}
            open={Boolean(sortMenuAnchor)}
            onClose={handleSortMenuClose}
          >
            {SORT_OPTIONS.map(({ field }) => {
              const isActive = sortField === field;
              
              return (
                <MenuItem 
                  key={field}
                  onClick={() => handleSortClick(field as SortField)}
                  sx={{
                    minHeight: '45px !important',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    px: '10px',
                    py: '4px',
                    my: '4px',
                    mx: '4px',
                    borderRadius: '12px',
                    backgroundColor: isActive 
                      ? theme.palette.primary.main 
                      : 'transparent',
                    '&:hover': {
                      backgroundColor: isActive
                        ? theme.palette.primary.dark
                        : theme.palette.action.hover,
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '20px',
                      height: '20px',
                      minWidth: '20px',
                    }}
                  >
                    {isActive && (
                      sortOrder === 'asc' 
                        ? <ArrowUpIcon sx={{ fontSize:'14px', color: theme.palette.primary.contrastText }} />
                        : <ArrowDownIcon sx={{ fontSize:'14px', color: theme.palette.primary.contrastText }} />
                    )}
                  </Box>
                  <Typography 
                    sx={{
                      color: isActive 
                        ? theme.palette.primary.contrastText 
                        : theme.palette.text.primary,
                      fontWeight: isActive ? '600px' : '400px',
                    }}
                  >
                    {getSortLabel(field as SortField, t)}
                  </Typography>
                </MenuItem>
              );
            })}
          </Menu>

          <Tooltip title={viewMode === 'grid' ? t('fileListToolbar.listView') : t('fileListToolbar.gridView')}>
            <IconButton 
              onClick={handleViewModeToggle}
              size="small"
            >
              {viewMode === 'grid' ? <ListViewIcon /> : <GridViewIcon />}
            </IconButton>
          </Tooltip>
      </Box>
    </Box>
  );
};

export default FileListToolbar;

