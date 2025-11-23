import { useState, useRef } from 'react';
import { Container, Fab } from '@mui/material';
import FileList, { FileListRef } from "../components/FileList";
import FileUploadModal from "../components/FileUploadModal";
import { useTheme } from '@mui/material/styles';

const UserFilesPage = () => {
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const fileListRef = useRef<FileListRef>(null);
    const theme = useTheme();

    const handleOpenUploadModal = () => {
        setIsUploadModalOpen(true);
    };

    const handleCloseUploadModal = () => {
        setIsUploadModalOpen(false);
    };

    const handleFileUploaded = () => {
        fileListRef.current?.refreshFiles();
    };

    return (
        <Container
            sx={{
                position: "relative",
                minHeight: "100vh",
            }}
        >
                <FileList ref={fileListRef} />
                
            <Fab
                color="primary"
                aria-label="add"
                onClick={handleOpenUploadModal}
                size="large"
                sx={{
                    position: "fixed",
                    bottom: {
                        xs: theme.spacing(3),
                        sm: theme.spacing(4)
                    },
                    right: {
                        xs: theme.spacing(3),
                        sm: theme.spacing(4)
                    },
                    width: {
                        xs: '56px',
                        sm: '72px'
                    },
                    height: {
                        xs: '56px',
                        sm: '72px'
                    },
                    fontSize: {
                        xs: theme.spacing(4),
                        sm: theme.spacing(5)
                    },
                }}
            >
                +
            </Fab>

                <FileUploadModal 
                    isOpen={isUploadModalOpen} 
                    onClose={handleCloseUploadModal}
                    onFileUploaded={handleFileUploaded}
                />
        </Container>
    );
}

export default UserFilesPage;