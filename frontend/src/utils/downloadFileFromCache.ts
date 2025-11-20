export const downloadFileFromCache = async (
  url: string,
  fileName: string
): Promise<boolean> => {
  try {
    const urlObj = new URL(url);
    const cacheKeyUrl = urlObj.origin + urlObj.pathname;
    
    const cachedResponse = await caches.match(cacheKeyUrl, {
      ignoreSearch: true,
      ignoreVary: true
    });
    
    if (!cachedResponse) {
      return false;
    }
    
    if (cachedResponse.type === 'opaque') {
      const arrayBuffer = await cachedResponse.arrayBuffer();
      
      if (arrayBuffer.byteLength === 0) {
        return false;
      }
    
      const blob = new Blob([arrayBuffer]);
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 100);
      
      return true;
    }
    
    const blob = await cachedResponse.blob();
    
    if (blob.size === 0) {
      return false;
    }
    
    const blobUrl = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
    }, 100);

    return true;

  } catch (error) {
    return false;
  }
};
