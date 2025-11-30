import React, { useCallback } from 'react';
import { Box, Pagination, MenuItem, Select, FormControl, useTheme, useMediaQuery } from '@mui/material';
import { ITEMS_PER_PAGE_OPTIONS } from '../types/FilterTypes';

interface FileListPaginationProps {
  totalItems: number;
  page: number;
  pageSize: number;
  onPaginationChange: (page: number, itemsPerPage: number) => void;
}

const FileListPagination = ({
  totalItems,
  page,
  pageSize,
  onPaginationChange
}: FileListPaginationProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handlePageChange = useCallback((_: React.ChangeEvent<unknown>, newPage: number) => {
    onPaginationChange(newPage, pageSize);
  }, [pageSize, onPaginationChange]);

  const handleItemsPerPageChange = useCallback((value: number) => {
    onPaginationChange(1, value);
  }, [onPaginationChange]);

  const totalPages = Math.ceil(totalItems / pageSize);

  return (
    <Box sx={{
        display: 'flex', 
        justifyContent: { xs: 'center', sm: 'space-between' },
        alignItems: 'center',
        gap: { xs: '0px', sm: '32px' },
        paddingTop: '40px',
        paddingBottom: '0px',
        position: 'relative',
        width: '100%'
    }}>
      <Box sx={{ 
        width: { xs: '0px', sm: '80px' }, 
        display: { xs: 'none', sm: 'block' }
      }} />
      
      {totalPages > 0 && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          width: { xs: '100%', sm: 'auto' } 
        }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            variant="outlined"
            shape="rounded"
            color="primary"
            size={isMobile ? "medium" : "large"}
          />
        </Box>
      )}

      <Box sx={{ 
        display: { xs: 'none', sm: 'flex' },
        alignItems: 'center',
        width: { xs: '0px', sm: '80px' },
        justifyContent: 'flex-end'
      }}>
        <FormControl size="small" sx={{ minWidth: '80px' }}>
          <Select
            value={pageSize}
            onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
            MenuProps={{
              anchorOrigin: {
                vertical: 'top',
                horizontal: 'left',
              },
              transformOrigin: {
                vertical: 'bottom',
                horizontal: 'left',
              },
              PaperProps: {
                sx: {
                  width: '80px',
                  transform: 'translateY(-10px) !important',
                  p: '4px',
                  borderRadius: '12px'
                },
              },
            }}
          >
            {ITEMS_PER_PAGE_OPTIONS.map((option) => (
              <MenuItem 
                key={option}
                value={option}
                sx={{
                    minHeight: '45px !important',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    gap: '12px',
                    px: '10px',
                    py: '4px',
                    my: '4px',
                    mx: '4px',
                    borderRadius: '12px'
                }}
              >
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </Box>
  );
};

export default FileListPagination;

