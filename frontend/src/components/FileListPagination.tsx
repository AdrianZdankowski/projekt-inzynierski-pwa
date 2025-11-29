import React, { useState, useEffect, useCallback } from 'react';
import { Box, Pagination, MenuItem, Select, FormControl, useTheme, useMediaQuery } from '@mui/material';
import { ITEMS_PER_PAGE_OPTIONS } from '../types/FilterTypes';

interface FileListPaginationProps {
  totalItems: number;
  onPaginationChange: (page: number, itemsPerPage: number) => void;
}

const FileListPagination = ({
  totalItems,
  onPaginationChange
}: FileListPaginationProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(isMobile ? 5 : 10);

  const handlePageChange = useCallback((_: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  }, []);

  const handleItemsPerPageChange = useCallback((value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  }, []);

  useEffect(() => {
    const newItemsPerPage = isMobile ? 5 : 10;
    if (itemsPerPage !== newItemsPerPage) {
      setItemsPerPage(newItemsPerPage);
      setCurrentPage(1);
    }
  }, [isMobile]);

  useEffect(() => {
    onPaginationChange(currentPage, itemsPerPage);
  }, [currentPage, itemsPerPage, onPaginationChange]);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

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
      
      {totalPages > 1 && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          width: { xs: '100%', sm: 'auto' } 
        }}>
          <Pagination
            count={totalPages}
            page={currentPage}
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
            value={itemsPerPage}
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

