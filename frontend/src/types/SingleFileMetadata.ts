export interface SingleFileMetadata {
    id: string;
    fileName: string;
    mimeType: string;
    size: number;
    uploadTimestamp: string;
    downloadUrl: string;
    expiresInSeconds: number;
    userId: string;
    ownerName: string;
}