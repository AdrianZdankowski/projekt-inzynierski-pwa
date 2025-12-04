import axiosInstance from "../api/axiosInstance";

// @ts-ignore
import SparkMD5 from "spark-md5";

const CHUNK_SIZE = 4 * 1024 * 1024;
const CHUNK_THRESHOLD = 4 * 1024 * 1024;

const generateBlockId = (index: number) => {
  const prefix = `block-${index.toString().padStart(6, '0')}`;
  const padded = prefix.padEnd(64, ' ');
  return btoa(padded);
};

const calculateMD5Checksum = async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer();

    const md5Hex = SparkMD5.ArrayBuffer.hash(buffer);

    const md5Bytes = new Uint8Array(md5Hex.match(/.{2}/g)!.map((b: string) => parseInt(b, 16)));
    const md5Base64 = btoa(String.fromCharCode(...md5Bytes));

    return md5Base64;
};

export const FileUploadService = {
  
  async getUploadLink(file: File, folderId?: string | null) {
    const uploadLinkResponse  = await axiosInstance.post("/file/generate-upload-link", {
      fileName: file.name,
      mimeType: file.type,
      expectedSize: file.size,
      folderId: folderId ?? null,
    });

    if (uploadLinkResponse.status !== 200) {
      throw new Error(`Upload link generation failed: ${uploadLinkResponse.status} ${uploadLinkResponse.statusText}`);
    }

    return { 
        fileId: uploadLinkResponse .data.fileId, 
        uploadUrl: uploadLinkResponse .data.uploadUrl 
    };
  },

  async uploadFileDirectly(file: File, uploadUrl: string) {
    const uploadResponse  = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "x-ms-blob-type": "BlockBlob",
        "x-ms-version": "2020-10-02",
        "Content-Type": file.type,
      },
      body: file,
    });

    if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`);
    } 
  },

  async uploadChunk(chunk: Blob, chunkUrl: string) {
    const uploadChunkResponse = await fetch(chunkUrl, {
        method: "PUT",
        headers: { 
            "x-ms-version": "2020-10-02", 
            "Content-Type": "application/octet-stream" 
        },
        body: chunk,
      });

      if (!uploadChunkResponse.ok){
        throw new Error(`Chunk upload failed: ${uploadChunkResponse .status} ${uploadChunkResponse .statusText}`);
      } 
  },

  async uploadFileChunked(file: File, uploadUrl: string) {
    const blockIds: string[] = [];
    
    for (let start = 0; start < file.size; start += CHUNK_SIZE) {
      const end = Math.min(file.size, start + CHUNK_SIZE);
      const chunk = file.slice(start, end);
      
      const blockNumber = Math.floor(start / CHUNK_SIZE) + 1;
      const blockId = generateBlockId(blockNumber);
      blockIds.push(blockId);

      const chunkUrl = `${uploadUrl}&comp=block&blockid=${encodeURIComponent(blockId)}`;
      await this.uploadChunk(chunk, chunkUrl);
    }

    const blockListXml = `<BlockList>${blockIds.map(id => `<Latest>${id}</Latest>`).join("")}</BlockList>`;
    
    const finalizeResponse = await fetch(`${uploadUrl}&comp=blocklist`, {
      method: "PUT",
      headers: { 
        "x-ms-version": "2020-10-02", 
        "Content-Type": "application/xml" 
      },
      body: blockListXml,
    });
    
    if (!finalizeResponse.ok){
        throw new Error(`Block list upload failed: ${finalizeResponse.status} ${finalizeResponse.statusText}`);
    } 
  },

  async commitFile(fileId: string, file: File) {
    const checksum = await calculateMD5Checksum(file);
    
    const commitFileResponse = await axiosInstance.post("/file/commit", {
      fileId: fileId,
      mimeType: file.type,
      size: file.size,
      checksum: checksum,
    });

    if (commitFileResponse.status !== 200) {
      throw new Error(`File commit failed: ${commitFileResponse.status} ${commitFileResponse.statusText}`);
    }
  },

  async uploadFile(file: File, folderId?: string | null) {
    const { fileId, uploadUrl } = await this.getUploadLink(file, folderId);
    
    if (file.size <= CHUNK_THRESHOLD) {
      console.log("Uploading directly (single PUT)...");
      await this.uploadFileDirectly(file, uploadUrl);
    } else {
      console.log("Uploading in chunks...");
      await this.uploadFileChunked(file, uploadUrl);
    }
    
    await this.commitFile(fileId, file);
  },
};
