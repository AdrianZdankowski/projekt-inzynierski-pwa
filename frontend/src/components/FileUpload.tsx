import { useState, useRef } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import { Box, Button, Typography, Alert, CircularProgress, Paper, Stack, Modal, IconButton } from '@mui/material';
import { DragDropBox } from '../themes/boxes/DragDropBox';
import { UploadFileBox } from '../themes/boxes/UploadFileBox';
import { FileUploadService } from '../services/FileUploadService';

interface FileUploadProps {
    isOpen: boolean;
    onClose: () => void;
    onFileUploaded?: () => void;
}

const FileUpload = ({ isOpen, onClose, onFileUploaded }: FileUploadProps) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setMessage(null); 
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setUploading(true);
        setMessage(null);

        try {
            await FileUploadService.uploadFile(selectedFile);

            setMessage({
                type: 'success',
                text: 'Plik został pomyślnie przesłany!'
            });

            setSelectedFile(null);
            
            // Notify parent component that file was uploaded
            if (onFileUploaded) {
                onFileUploaded();
            }

        } catch (error) {
            console.error('Upload error:', error);
            setMessage({
                type: 'error',
                text: 'Wystąpił błąd podczas przesyłania pliku'
            });
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
            setMessage(null);
        }
    };

    const handleClose = () => {
        setSelectedFile(null);
        setMessage(null);
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
            <DragDropBox
            >
                <Paper 
                    elevation={3} 
                >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h5">
                            Prześlij plik
                        </Typography>
                        <IconButton onClick={handleClose}>
                            <CloseIcon />
                        </IconButton>
                    </Box>
                    
                    {message && (
                        <Alert 
                            severity={message.type} 
                            onClose={() => setMessage(null)}
                        >
                            {message.text}
                        </Alert>
                    )}

                    <UploadFileBox
                        onDragOver={selectedFile ? undefined : handleDragOver}
                        onDragLeave={selectedFile ? undefined : handleDragLeave}
                        onDrop={selectedFile ? undefined : handleDrop}
                        selectedFile={!!selectedFile}
                        isDragOver={isDragOver}
                    >
                        <Typography variant="h3" className={selectedFile ? "selectedFile" : isDragOver ? "dragOver" : "defaultState"}>
                            {selectedFile ? '📄' : (isDragOver ? '📤' : '📁')}
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            {selectedFile ? 'Plik już wybrany' : (isDragOver ? 'Upuść plik tutaj!' : 'Przeciągnij i upuść plik tutaj lub kliknij aby wybrać')}
                        </Typography>
                        
                        <input
                            ref={fileInputRef}
                            type="file"
                            onChange={handleFileSelect}
                            style={{ display: 'none' }}
                            accept="*/*"
                            disabled={!!selectedFile}
                        />
                        
                        {!selectedFile && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                                <Button
                                    variant="outlined"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    Wybierz plik
                                </Button>
                            </Box>
                        )}
                    </UploadFileBox>

                    {selectedFile && (
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="body2">
                                Wybrany plik: <strong>{selectedFile.name}</strong>
                            </Typography>
                            <Typography variant="body2">
                                Rozmiar: <strong>{(selectedFile.size / 1024).toFixed(2)} KB</strong>
                            </Typography>
                        </Box>
                    )}

                    <Stack direction="row" spacing={2}>
                        <Button
                            variant="contained"
                            onClick={handleUpload}
                            disabled={!selectedFile || uploading}
                            startIcon={uploading ? <CircularProgress size={20} /> : null}
                        >
                            {uploading ? 'Wysyłanie...' : 'Wyślij plik'}
                        </Button>
                        
                        {selectedFile && (
                            <Button
                                variant="outlined"
                                onClick={() => {
                                    setSelectedFile(null);
                                    setMessage(null);
                                    if (fileInputRef.current) {
                                        fileInputRef.current.value = '';
                                    }
                                }}
                                disabled={uploading}
                            >
                                Resetuj
                            </Button>
                        )}
                    </Stack>
                </Paper>
            </DragDropBox>
        </Modal>
    );
};

export default FileUpload; 