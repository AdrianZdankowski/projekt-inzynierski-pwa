# 📤 Instrukcja: Wysyłanie plików do Azure Blob Storage (PWA Backend)



Ten dokument opisuje sposób implementacji uploadu plików z poziomu frontendowej aplikacji SPA (np. Vue/React) przy użyciu backendowego API oraz Azure Blob Storage. Obsługiwane są zarówno **małe pliki** (do ok. 250MB), jak i **duże pliki** (do 4GB) poprzez **chunked upload z PutBlock/PutBlockList**.



---



## ✅ 1. Uzyskanie SAS URL do uploadu



Wywołaj endpoint backendu w celu otrzymania podpisanego linku SAS (Shared Access Signature), do którego frontend może bezpośrednio wrzucić plik do Azure.



### Endpoint:

```

GET /api/file/generate-upload-link?fileName={nazwaPliku}&contentType={mimeType}

```



### Przykład:

```

GET /api/file/generate-upload-link?fileName=video.mp4&contentType=video/mp4

```



### Odpowiedź:

```json

{

&nbsp; "uploadUrl": "https://twojstorage.blob.core.windows.net/container/video.mp4?...sasToken..."

}

```



---



## 🔹 2A. Upload małego pliku 



Jeśli plik jest niewielki, wystarczy **wysłać go w jednym zapytaniu PUT** na otrzymany `uploadUrl`.



```js

await fetch(uploadUrl, {

&nbsp; method: 'PUT',

&nbsp; headers: {

&nbsp;   'x-ms-blob-type': 'BlockBlob',

&nbsp;   'x-ms-version': '2020-10-02',

&nbsp;   'Content-Type': file.type

&nbsp; },

&nbsp; body: file

});

```



---



## 🔹 2B. Upload dużego pliku (chunking)



### 🔁 Podział pliku na fragmenty (np. 4MB)



```js

const CHUNK_SIZE = 4 * 1024 * 1024;

const blockIds = [];



for (let start = 0; start < file.size; start += CHUNK_SIZE) {

&nbsp; const end = Math.min(file.size, start + CHUNK_SIZE);

&nbsp; const chunk = file.slice(start, end);

&nbsp; const blockId = btoa(String(start).padStart(6, '0')); // base64 ID

&nbsp; blockIds.push(blockId);



&nbsp; const chunkUrl = `${uploadUrl}&comp=block&blockid=${encodeURIComponent(blockId)}`;



&nbsp; await fetch(chunkUrl, {

&nbsp;   method: 'PUT',

&nbsp;   headers: {

&nbsp;     'x-ms-blob-type': 'BlockBlob',

&nbsp;     'x-ms-version': '2020-10-02',

&nbsp;     'Content-Type': file.type

&nbsp;   },

&nbsp;   body: chunk

&nbsp; });

}

```



---



### 🧱 Zakończenie uploadu – `PutBlockList`



Po wysłaniu wszystkich bloków należy zakończyć upload przez przesłanie listy blocków:



```js

const blockListXml = `

<BlockList>

&nbsp; ${blockIds.map(id => `<Latest>${id}</Latest>`).join('')}

</BlockList>

`;



await fetch(`${uploadUrl}&comp=blocklist`, {

&nbsp; method: 'PUT',

&nbsp; headers: {

&nbsp;   'x-ms-version': '2020-10-02',

&nbsp;   'Content-Type': 'application/xml'

&nbsp; },

&nbsp; body: blockListXml

});

```



---



## ✅ 3. Potwierdzenie uploadu w backendzie (`/commit`)



Po zapisaniu pliku w Azure, frontend musi **poinformować backend**, aby zapisać metadane.



### Endpoint:

```

POST /api/file/commit

```



### Payload:

```json

{

&nbsp; "fileName": "video.mp4",

&nbsp; "mimeType": "video/mp4",

&nbsp; "size": 4294967296,

&nbsp; "blobUri": "https://twojstorage.blob.core.windows.net/container/video.mp4",

&nbsp; "uploadTimestamp": "2025-07-29T18:00:00Z"

}

```



- Pole `userId` nie jest wymagane – backend pobierze je z JWT.



---



## ℹ️ Uwagi końcowe



- Wszystkie pliki uploadowane są **bezpośrednio do Azure**, bez obciążania backendu.

- Backend:

&nbsp; - generuje bezpieczny link SAS do uploadu

&nbsp; - przyjmuje metadane po zakończeniu

- Frontend:

&nbsp; - wysyła plik (PUT)

&nbsp; - w przypadku dużych – dzieli plik i wysyła chunkami

&nbsp; - kończy upload przez `PutBlockList`

&nbsp; - wywołuje endpoint `/commit`



---



## 🛠️ Debugowanie



- Jeśli plik nie pojawia się w Azure: upewnij się, że użyto `PutBlockList`.

- Jeśli metadane się nie zapisują – sprawdź token JWT i czy commit został poprawnie wysłany.



