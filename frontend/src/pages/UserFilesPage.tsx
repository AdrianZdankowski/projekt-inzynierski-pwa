import { useState, useCallback } from 'react';
import { Container, Fab } from '@mui/material';
import FileList from "../components/fileList/FileList";
import FileUploadModal from "../components/fileOperations/FileUploadModal";
import { useTheme } from '@mui/material/styles';

const UserFilesPage = () => {
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [refreshFiles, setRefreshFiles] = useState<(() => void) | null>(null);
    const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
    const [canAddToFolder, setCanAddToFolder] = useState<boolean>(true);
    const theme = useTheme();

    const handleOpenUploadModal = () => {
        setIsUploadModalOpen(true);
    };

    const handleCloseUploadModal = () => {
        setIsUploadModalOpen(false);
    };

    const handleFileUploaded = useCallback(() => {
        refreshFiles?.();
    }, [refreshFiles]);

    const handleRefreshReady = useCallback((refreshFn: () => void) => {
        setRefreshFiles(() => refreshFn);
    }, []);

    const handleFolderChange = useCallback((folderId: string | null, canAdd?: boolean) => {
        setCurrentFolderId(folderId);
        setCanAddToFolder(canAdd ?? true);
    }, []);

    return (
        <Container
            sx={{
                position: "relative",
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                paddingBottom: '24px'
            }}
        >
                <FileList 
                    onRefreshReady={handleRefreshReady}
                    onFolderChange={handleFolderChange}
                />
                
            {canAddToFolder && (
                <Fab
                    color="primary"
                    aria-label="add"
                    onClick={handleOpenUploadModal}
                    size="large"
                    sx={{
                        position: "fixed",
                        bottom: {
                            xs: theme.spacing(3),
                            md: theme.spacing(4)
                        },
                        right: {
                            xs: theme.spacing(3),
                            md: theme.spacing(4)
                        },
                        width: {
                            xs: '56px',
                            md: '72px'
                        },
                        height: {
                            xs: '56px',
                            md: '72px'
                        },
                        fontSize: {
                            xs: theme.spacing(4),
                            md: theme.spacing(5)
                        },
                    }}
                >
                    +
                </Fab>
            )}

            <FileUploadModal 
                    isOpen={isUploadModalOpen} 
                    onClose={handleCloseUploadModal}
                    onFileUploaded={handleFileUploaded}
                    currentFolderId={currentFolderId}
                />
        </Container>
    );
}

export default UserFilesPage;