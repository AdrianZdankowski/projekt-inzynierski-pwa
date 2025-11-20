import { FileService } from "../services/FileService"
import { SingleFileMetadata } from "../types/SingleFileMetadata"


export const downloadFile = async (fileId: string, url?: string, fileName?: string): Promise<void> => {
    try {
        // Pobierz metadata jeśli nie mamy URL
        if (!url) {
            const fileData: SingleFileMetadata = await FileService.getUserFile(fileId);
            url = fileData.downloadUrl;
            fileName = fileName || fileData.fileName;
            if (!url) throw new Error("Brak linku do pobrania pliku!");
        }

        // Spróbuj pobrać z CORS (jeśli jest skonfigurowany)
        let response = await fetch(url, {
            mode: 'cors',
            credentials: 'omit'
        }).catch(() => null);
        
        // Jeśli CORS nie działa, spróbuj bez (opaque response)
        if (!response || response.type === 'opaque') {
            // Fallback: użyj linka bezpośrednio (działa dla opaque)
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName || 'plik';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            return;
        }
        
        if (!response.ok) {
            throw new Error(`Błąd pobierania: ${response.status}`);
        }

        // Konwertuj response na Blob (tylko jeśli mamy CORS)
        const blob = await response.blob();
        
        // Stwórz lokalny URL dla Blob
        const blobUrl = URL.createObjectURL(blob);
        
        // Pobierz przez <a> tag
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = fileName || 'plik';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Zwolnij pamięć po krótkiej chwili
        setTimeout(() => {
            URL.revokeObjectURL(blobUrl);
        }, 100);
        
    } catch (error) {
        console.error("Błąd podczas pobierania pliku: ", error);
        throw error; // Propaguj błąd żeby UI mógł obsłużyć
    }
}
    
