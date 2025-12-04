import { useState, useRef } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import FolderIcon from '@mui/icons-material/Folder';
import { Box, Button, Typography, CircularProgress, Modal, IconButton, useTheme, useMediaQuery } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNotification } from '../../context/NotificationContext';
import { FileUploadService } from '../../services/FileUploadService';

interface FileUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onFileUploaded?: () => void;
  currentFolderId?: string | null;
}

const FileUploadModal = ({ isOpen, onClose, onFileUploaded, currentFolderId }: FileUploadModalProps) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { t } = useTranslation();
    const { showNotification } = useNotification();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const renderUploadIcon = () => {
        const iconSize = isMobile ? '48px' : '64px';
        
        if (selectedFile) {
            return (
                <InsertDriveFileIcon 
                    sx={{ 
                        fontSize: iconSize, 
                        color: theme.palette.text.secondary,
                        opacity: '0.6'
                    }} 
                />
            );
        }
        
        if (isDragOver) {
            return (
                <CloudUploadIcon 
                    sx={{ 
                        fontSize: iconSize, 
                        color: theme.palette.primary.main 
                    }} 
                />
            );
        }
        
        return (
            <FolderIcon 
                sx={{ 
                    fontSize: iconSize, 
                    color: theme.palette.text.secondary 
                }} 
            />
        );
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setUploading(true);

      try {
            await FileUploadService.uploadFile(selectedFile, currentFolderId);

            showNotification(t('fileUpload.success'), 'success');

            setSelectedFile(null);
            
            if (onFileUploaded) {
                onFileUploaded();
            }

            handleClose();

        } catch (error) {
            console.error('Upload error:', error);
            showNotification(t('fileUpload.error'), 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleDragOver = (event: React.DragEvent) => {
        event.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (event: React.DragEvent) => {
        event.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (event: React.DragEvent) => {
        event.preventDefault();
        setIsDragOver(false);
        const file = event.dataTransfer.files[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleClose = () => {
        setSelectedFile(null);
        setIsDragOver(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        onClose();
    };

    return (
        <Modal
            open={isOpen}
            onClose={handleClose}
            aria-labelledby="file-upload-modal"
            aria-describedby="file-upload-modal-description"
        >
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: {
                        xs: '90%',
                        sm: '500px',
                        md: '600px'
                    },
                    maxWidth: '90vw',
                    height: {
                        xs: '50%',
                        sm: '600px'
                    },
                    maxHeight: {
                        xs: '75vh',
                        sm: '90vh'
                    },
                    boxShadow: theme.shadows[24],
                    outline: 'none',
                    backgroundColor: theme.palette.background.paper,
                    borderRadius: {
                        xs: '12px',
                        sm: '16px'
                    },
                    display: 'flex',
                    flexDirection: 'column',
                    padding: {
                        xs: '16px',
                        sm: '20px',
                        md: '24px'
                    },
                    overflow: 'auto'
                }}
            >
                        {/* Header */}
                        <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            marginBottom: {
                                xs: '12px',
                                sm: '16px'
                            }
                        }}>
                            <Typography 
                                variant={isMobile ? "h6" : "h5"}
                                sx={{
                                    fontSize: {
                                        xs: '1.1rem',
                                        sm: '1.5rem'
                                    }
                                }}
                            >
                                {t('fileUpload.title')}
                            </Typography>
                            <IconButton onClick={handleClose} size="small">
                                <CloseIcon />
                            </IconButton>
                        </Box>

                        {/* Upload Area */}
                        <Box
                            onDragOver={selectedFile ? undefined : handleDragOver}
                            onDragLeave={selectedFile ? undefined : handleDragLeave}
                            onDrop={selectedFile ? undefined : handleDrop}
                            sx={{
                                border: `2px dashed ${selectedFile ? theme.palette.divider : isDragOver ? theme.palette.primary.main : theme.palette.divider}`,
                                borderRadius: {
                                    xs: "8px",
                                    sm: "10px"
                                },
                                padding: {
                                    xs: "16px",
                                    sm: "20px",
                                    md: "24px"
                                },
                                textAlign: 'center',
                                marginBottom: {
                                    xs: "12px",
                                    sm: "16px"
                                },
                                backgroundColor: selectedFile 
                                    ? theme.palette.action.disabledBackground 
                                    : isDragOver 
                                        ? theme.palette.action.hover 
                                        : theme.palette.background.paper,
                                transition: 'all 0.2s ease-in-out',
                                transform: selectedFile ? 'scale(1)' : isDragOver ? (isMobile ? 'scale(1)' : 'scale(1.02)') : 'scale(1)',
                                flex: '1',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                minHeight: {
                                    xs: '200px',
                                    sm: '300px'
                                },
                                opacity: selectedFile ? '0.6' : '1',
                                pointerEvents: 'auto',
                                '&:hover': selectedFile
                                    ? {}
                                    : {
                                        borderColor: theme.palette.primary.main,
                                        backgroundColor: theme.palette.action.hover,
                                    },
                            }}
                        >
                            <Box sx={{ 
                                display: 'flex', 
                                flexDirection: 'column', 
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: {
                                    xs: '12px',
                                    sm: '16px'
                                }
                            }}>
                                {renderUploadIcon()}
                                <Typography 
                                    variant="body1"
                                    sx={{
                                        fontSize: {
                                            xs: '0.875rem',
                                            sm: '1rem'
                                        },
                                        paddingX: {
                                            xs: '8px',
                                            sm: '0'
                                        },
                                        wordBreak: 'break-word',
                                        textAlign: 'center'
                                    }}
                                >
                                    {selectedFile ? selectedFile.name : (isDragOver ? t('fileUpload.dropHere') : t('fileUpload.dragDropOrClick'))}
                                </Typography>
                                
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    onChange={handleFileSelect}
                                    style={{ display: 'none' }}
                                    accept="*/*"
                                    disabled={!!selectedFile}
                                />
                                
                                {!selectedFile ? (
                                    <Button
                                        variant="outlined"
                                        onClick={() => fileInputRef.current?.click()}
                                        sx={{ 
                                            marginTop: {
                                                xs: '12px',
                                                sm: '16px'
                                            },
                                            width: {
                                                xs: '100%',
                                                sm: 'auto'
                                            }
                                        }}
                                    >
                                        {t('fileUpload.selectFile')}
                                    </Button>
                                ) : (
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        onClick={handleRemoveFile}
                                        disabled={uploading}
                                        sx={{ 
                                            marginTop: {
                                                xs: '12px',
                                                sm: '16px'
                                            },
                                            width: {
                                                xs: '100%',
                                                sm: 'auto'
                                            }
                                        }}
                                    >
                                        {t('fileUpload.removeFile')}
                                    </Button>
                                )}
                            </Box>
                        </Box>

                        {/* Action Buttons */}
                        <Box sx={{ 
                            mt: 'auto',
                            paddingTop: {
                                xs: '12px',
                                sm: '16px'
                            },
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            <Button
                                variant="contained"
                                onClick={handleUpload}
                                disabled={!selectedFile || uploading}
                                startIcon={uploading ? <CircularProgress size={20} /> : null}
                                sx={{ 
                                    minWidth: {
                                        xs: '100%',
                                        sm: '150px'
                                    },
                                    width: {
                                        xs: '100%',
                                        sm: 'auto'
                                    }
                                }}
                            >
                                {uploading ? t('fileUpload.uploading') : t('fileUpload.uploadFile')}
                            </Button>
                        </Box>
            </Box>
        </Modal>
    );
};

export default FileUploadModal; 