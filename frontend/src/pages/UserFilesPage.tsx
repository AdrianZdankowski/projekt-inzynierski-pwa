import { useState } from 'react';
import { Box, Fab } from '@mui/material';
import FileListComponent from "../components/FileListComponent";
import FileUploadComponent from "../components/FileUploadComponent";

const UserFilesPage = () => {
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    const handleOpenUploadModal = () => {
        setIsUploadModalOpen(true);
    };

    const handleCloseUploadModal = () => {
        setIsUploadModalOpen(false);
    };

    return (
        <Box sx={{ position: 'relative', minHeight: '100vh' }}>
            <h1 style={{ textAlign: 'center', marginTop: '20px', color: 'white' }}>Twoje pliki:</h1>
            <FileListComponent />
            
            <Fab
                color="primary"
                aria-label="add"
                onClick={handleOpenUploadModal}
                size="large"
                sx={{
                    position: 'fixed',
                    bottom: 48,
                    right: 48,
                    backgroundColor: '#06d07c9f',
                    '&:hover': { backgroundColor: '#58B19F' },
                    width: 72,
                    height: 72,
                    fontSize: 32
                }}
            >
                +
            </Fab>

            <FileUploadComponent 
                isOpen={isUploadModalOpen} 
                onClose={handleCloseUploadModal} 
            />
        </Box>
    );
}

export default UserFilesPage;