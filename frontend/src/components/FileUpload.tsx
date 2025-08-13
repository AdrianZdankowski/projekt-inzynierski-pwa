import { useState, useRef } from 'react';
import { 
    Box, 
    Button, 
    Typography, 
    Alert, 
    CircularProgress,
    Paper,
    Stack,
    Modal,
    IconButton
} from '@mui/material';

import axiosInstance from '../api/axiosInstance';

interface FileUploadProps {
    isOpen: boolean;
    onClose: () => void;
}

const FileUpload = ({ isOpen, onClose }: FileUploadProps) => {
    // TODO: edit in the future
    const CHUNK_SIZE = 1 * 1024 * 1024; // 1MB - rozmiar chunka
    const CHUNK_THRESHOLD = 4 * 1024 * 1024; // 4MB - granica podziału

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

    const getUploadLink = async (file: File) => {
        const uploadLinkResponse = await axiosInstance.get('/file/generate-upload-link', {
            params: {
                fileName: file.name,
                contentType: file.type
            }
        });
        return uploadLinkResponse.data.uploadUrl;
    };

    const uploadChunk = async (chunk: Blob, chunkUrl: string) => {
        const response = await fetch(chunkUrl, {
            method: 'PUT',
            headers: {
                'x-ms-version': '2020-10-02',
                'Content-Type': 'application/octet-stream'
            },
            body: chunk
        });

        if (!response.ok) {
            throw new Error(`Chunk upload failed: ${response.status} ${response.statusText}`);
        }
    };

    const uploadFileDirectly = async (file: File, uploadUrl: string) => {
        const uploadResponse = await fetch(uploadUrl, {
            method: 'PUT',
            headers: {
                'x-ms-blob-type': 'BlockBlob',
                'x-ms-version': '2020-10-02',
                'Content-Type': file.type
            },
            body: file
        });

        if (!uploadResponse.ok) {
            throw new Error(`Upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`);
        }
    };

    const generateBlockId = (index: number) => {
        const prefix = `block-${index.toString().padStart(6, '0')}`;
        const padded = prefix.padEnd(64, ' ');
        return btoa(padded);
      };

    const uploadFileChunked = async (file: File, uploadUrl: string) => {
        const blockIds: string[] = [];

        for (let start = 0; start < file.size; start += CHUNK_SIZE) {
            const end = Math.min(file.size, start + CHUNK_SIZE);
            const chunk = file.slice(start, end);
            
            const blockNumber = Math.floor(start / CHUNK_SIZE) + 1;
            const blockId = generateBlockId(blockNumber);
            blockIds.push(blockId);

            const chunkUrl = `${uploadUrl}&comp=block&blockid=${encodeURIComponent(blockId)}`;
            await uploadChunk(chunk, chunkUrl);
        }

        const blockListXml = `<BlockList>${blockIds.map(id => `<Latest>${id}</Latest>`).join('')}</BlockList>`;

        const finalizeResponse = await fetch(`${uploadUrl}&comp=blocklist`, {
            method: 'PUT',
            headers: {
                'x-ms-version': '2020-10-02',
                'Content-Type': 'application/xml'
            },
            body: blockListXml
        });

        if (!finalizeResponse.ok) {
            throw new Error(`Block list upload failed: ${finalizeResponse.status} ${finalizeResponse.statusText}`);
        }
    };

    const uploadFileToBlob = async (file: File, uploadUrl: string) => {
        if (file.size <= CHUNK_THRESHOLD) {
            console.log("Uploading directly (single PUT)...");
            await uploadFileDirectly(file, uploadUrl);
        } else {
            console.log("Uploading in chunks...");
            await uploadFileChunked(file, uploadUrl);
        }
    };

    const commitFileToBackend = async (file: File, uploadUrl: string) => {
        await axiosInstance.post('/file/commit', {
            fileName: file.name,
            mimeType: file.type,
            size: file.size,
            blobUri: uploadUrl.split('?')[0], // Remove SAS token from URI
            uploadTimestamp: new Date().toISOString()
        });
    };

    const uploadFile = async (file: File) => {
        const uploadUrl = await getUploadLink(file);
        await uploadFileToBlob(file, uploadUrl);
        await commitFileToBackend(file, uploadUrl);
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setUploading(true);
        setMessage(null);

        try {
            await uploadFile(selectedFile);

            setMessage({
                type: 'success',
                text: 'Plik został pomyślnie przesłany!'
            });

            setSelectedFile(null)

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
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 500,
                    height: 500,
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    boxShadow: 24,
                    p: 0,
                    outline: 'none'
                }}
            >
                <Paper 
                    elevation={3} 
                    sx={{ 
                        p: 3, 
                        backgroundColor: '#f5f5f5',
                        height: '100%',
                        borderRadius: 2,
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h5">
                            Prześlij plik
                        </Typography>
                        <IconButton onClick={handleClose} size="small">
                            ×
                        </IconButton>
                    </Box>
                    
                    {message && (
                        <Alert 
                            severity={message.type} 
                            sx={{ mb: 2 }}
                            onClose={() => setMessage(null)}
                        >
                            {message.text}
                        </Alert>
                    )}

                    <Box
                        onDragOver={selectedFile ? undefined : handleDragOver}
                        onDragLeave={selectedFile ? undefined : handleDragLeave}
                        onDrop={selectedFile ? undefined : handleDrop}
                        sx={{
                            border: `2px dashed ${selectedFile ? '#ccc' : (isDragOver ? '#1976d2' : '#ccc')}`,
                            borderRadius: 2,
                            p: 3,
                            textAlign: 'center',
                            mb: 2,
                            backgroundColor: selectedFile ? '#f0f0f0' : (isDragOver ? '#e3f2fd' : 'white'),
                            transition: 'all 0.2s ease-in-out',
                            transform: selectedFile ? 'scale(1)' : (isDragOver ? 'scale(1.02)' : 'scale(1)'),
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            opacity: selectedFile ? 0.6 : 1,
                            pointerEvents: selectedFile ? 'none' : 'auto',
                            '&:hover': selectedFile ? {} : {
                                borderColor: '#1976d2',
                                backgroundColor: '#f8f9fa'
                            }
                        }}
                    >
                        <Typography variant="h3" sx={{ color: selectedFile ? '#999' : (isDragOver ? '#1976d2' : '#666'), mb: 2, transition: 'color 0.2s ease-in-out' }}>
                            {selectedFile ? '📄' : (isDragOver ? '📤' : '📁')}
                        </Typography>
                        <Typography variant="body1" color="text.secondary" gutterBottom>
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
                                    sx={{ minWidth: '100px', maxWidth: '180px' }}
                                >
                                    Wybierz plik
                                </Button>
                            </Box>
                        )}
                    </Box>

                    {selectedFile && (
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                                Wybrany plik: <strong>{selectedFile.name}</strong>
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Rozmiar: {(selectedFile.size / 1024).toFixed(2)} KB
                            </Typography>
                        </Box>
                    )}

                    <Stack direction="row" spacing={2} justifyContent="center">
                        <Button
                            variant="contained"
                            onClick={handleUpload}
                            disabled={!selectedFile || uploading}
                            startIcon={uploading ? <CircularProgress size={20} /> : null}
                            sx={{ 
                                backgroundColor: '#06d07c9f',
                                '&:hover': { backgroundColor: '#58B19F' },
                                minWidth: '120px'
                            }}
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
                                sx={{ minWidth: '120px' }}
                            >
                                Resetuj
                            </Button>
                        )}
                    </Stack>
                </Paper>
            </Box>
        </Modal>
    );
};

export default FileUpload; 