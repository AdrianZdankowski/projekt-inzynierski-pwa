import { useState, useRef } from 'react';
import { Container, Fab } from '@mui/material';
import FileList, { FileListRef } from "../components/FileList";
import FileUploadModal from "../components/FileUploadModal";

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
        fileListRef.current?.refreshFiles();
    };

    return (
        <Container>
                <FileList ref={fileListRef} />
                
            <Fab
                color="primary"
                aria-label="add"
                onClick={handleOpenUploadModal}
                size="large"
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