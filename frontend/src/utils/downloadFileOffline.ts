import { SingleFileMetadata } from "../types/SingleFileMetadata"

/**
 * Pobiera plik gdy użytkownik jest OFFLINE
 * Wymaga aby plik i jego metadata były wcześniej w cache
 */
export const downloadFileOffline = async (fileId: string): Promise<void> => {
  try {
    
    const metadataCache = await caches.open('file-metadata-cache');
    
    const allMetadataKeys = await metadataCache.keys();
    const metadataRequest = allMetadataKeys.find(req => req.url.includes(`/api/file/${fileId}`));
    
    if (!metadataRequest) {
      throw new Error('Dane pliku nie są dostępne offline');
    }
    
    const metadataResponse = await metadataCache.match(metadataRequest);
    if (!metadataResponse) {
      throw new Error('Błąd odczytu danych pliku z cache.');
    }
    
    const fileData: SingleFileMetadata = await metadataResponse.json();
  
    const blobCache = await caches.open('azure-blob-files');
    
    const urlObj = new URL(fileData.downloadUrl);
    
    const allBlobKeys = await blobCache.keys();
    
    const blobRequest = allBlobKeys.find(req => req.url.includes(urlObj.pathname));
    
    if (!blobRequest) {
      throw new Error('Dane pliku nie są dostępne offline');
    }
    
    const cachedResponse = await blobCache.match(blobRequest);
    if (!cachedResponse) {
      throw new Error('Błąd odczytu pliku z cache.');
    }
    
    
    const blob = await cachedResponse.blob();
    
    if (blob.size === 0) {
      throw new Error('Plik w cache jest pusty.');
    }
    
    const blobUrl = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileData.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
    }, 100);
  } catch (error: any) {
    throw new Error(error.message || 'Nie udało się pobrać pliku offline.');
  }
};
