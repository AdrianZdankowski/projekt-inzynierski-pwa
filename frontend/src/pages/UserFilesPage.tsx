import { useState } from 'react';
import { Container, Fab, Typography } from '@mui/material';
import FileList from "../components/FileList";
import FileUpload from "../components/FileUpload";
import { ThemeProvider } from '@emotion/react';
import UploadFileTheme from '../themes/components/UploadFileTheme';

const UserFilesPage = () => {
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    const handleOpenUploadModal = () => {
        setIsUploadModalOpen(true);
    };

    const handleCloseUploadModal = () => {
        setIsUploadModalOpen(false);
    };

    return (
        <Container>
            <Typography>Moje pliki:</Typography>
            <FileList />
                
            <Fab
                color="primary"
                aria-label="add"
                onClick={handleOpenUploadModal}
                size="large"
            >
                +
            </Fab>

            <ThemeProvider theme={UploadFileTheme}>
                <FileUpload 
                    isOpen={isUploadModalOpen} 
                    onClose={handleCloseUploadModal} 
                />
            </ThemeProvider>
        </Container>
    );
}

export default UserFilesPage;