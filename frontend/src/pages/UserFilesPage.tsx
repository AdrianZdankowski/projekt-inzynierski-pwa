import { useState } from 'react';
import { Box, Fab } from '@mui/material';
import FileList from "../components/FileList";
import FileUpload from "../components/FileUpload";

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
            <h1 style={{ textAlign: 'center', marginTop: '20px', color: 'white' }}>Moje pliki:</h1>
            <FileList />
            
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

            <FileUpload 
                isOpen={isUploadModalOpen} 
                onClose={handleCloseUploadModal} 
            />
        </Box>
    );
}

export default UserFilesPage;