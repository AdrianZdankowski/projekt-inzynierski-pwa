import { useState, useRef } from 'react';
import CloseIcon from '@mui/icons-material/Close';
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
import { DragDropBox } from '../themes/boxes/DragDropBox';
import { UploadFileBox } from '../themes/boxes/UploadFileBox';

// @ts-ignore
import SparkMD5 from "spark-md5";

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
        const uploadLinkResponse = await axiosInstance.post('/file/generate-upload-link', {
            fileName: file.name,
            mimeType: file.type,
            expectedSize: file.size
        });
        return {
            fileId: uploadLinkResponse.data.fileId,
            uploadUrl: uploadLinkResponse.data.uploadUrl
        };
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

    const calculateMD5Checksum = async (file: File): Promise<string> => {
        const buffer = await file.arrayBuffer();
    
        const md5Hex = SparkMD5.ArrayBuffer.hash(buffer);
    
        const md5Bytes = new Uint8Array(md5Hex.match(/.{2}/g)!.map((byte: string) => parseInt(byte, 16)));
        const md5Base64 = btoa(String.fromCharCode(...md5Bytes));
    
        return md5Base64;
    };

    const commitFileToBackend = async (fileId: string, file: File) => {
        const checksum = await calculateMD5Checksum(file);
        await axiosInstance.post('/file/commit', {
            fileId: fileId,
            mimeType: file.type,
            size: file.size,
            checksum: checksum
        });
    };

    const uploadFile = async (file: File) => {
        const { fileId, uploadUrl } = await getUploadLink(file);
        await uploadFileToBlob(file, uploadUrl);
        await commitFileToBackend(fileId, file);
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