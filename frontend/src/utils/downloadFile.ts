import { FileService } from "../services/FileService"
import { SingleFileMetadata } from "../types/SingleFileMetadata"

export const downloadFile = async (fileId: string, url?: string, fileName?: string): Promise<void> => {
    try {
        if (!url) {
            const fileData: SingleFileMetadata = await FileService.getUserFile(fileId);
            url = fileData.downloadUrl;
            if (!url) throw new Error("Brak linku do pobrania pliku!");
        }

        const link = document.createElement('a');
        link.href=url;
        link.download = fileName || 'plik';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error("Błąd podczas pobierania pliku: ", error)
    }
}
    