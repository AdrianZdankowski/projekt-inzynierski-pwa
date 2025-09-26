import { useState, useRef } from 'react';
import { Container, Fab } from '@mui/material';
import FileList, { FileListRef } from "../components/FileList";
import FileUpload from "../components/FileUpload";
import { ThemeProvider } from '@emotion/react';
import UploadFileTheme from '../themes/components/UploadFileTheme';
import FileListTheme from '../themes/components/FileListTheme';

const UserFilesPage = () => {
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const fileListRef = useRef<FileListRef>(null);

    const handleOpenUploadModal = () => {
        setIsUploadModalOpen(true);
    };

    const handleCloseUploadModal = () => {
        setIsUploadModalOpen(false);
    };

    const handleFileUploaded = () => {
        // Trigger refresh of file list using ref
        fileListRef.current?.refreshFiles();
    };

    return (
        <Container>
            <ThemeProvider theme={FileListTheme}>
                <FileList ref={fileListRef} />
            </ThemeProvider>
                
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
                    onFileUploaded={handleFileUploaded}
                />
            </ThemeProvider>
        </Container>
    );
}

export default UserFilesPage;