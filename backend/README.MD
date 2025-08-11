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

 "uploadUrl": "https://twojstorage.blob.core.windows.net/container/video.mp4?...sasToken..."

}

```



---



## 🔹 2A. Upload małego pliku 



Jeśli plik jest niewielki, wystarczy **wysłać go w jednym zapytaniu PUT** na otrzymany `uploadUrl`.



```js

await fetch(uploadUrl, {

 method: 'PUT',

 headers: {

   'x-ms-blob-type': 'BlockBlob',

   'x-ms-version': '2020-10-02',

   'Content-Type': file.type

 },

 body: file

});

```



---



## 🔹 2B. Upload dużego pliku (chunking)



### 🔁 Podział pliku na fragmenty (np. 4MB)



```js

const CHUNK_SIZE = 4 * 1024 * 1024;

const blockIds = [];



for (let start = 0; start < file.size; start += CHUNK_SIZE) {

 const end = Math.min(file.size, start + CHUNK_SIZE);

 const chunk = file.slice(start, end);

 const blockId = btoa(String(start).padStart(6, '0')); // base64 ID

 blockIds.push(blockId);



 const chunkUrl = `${uploadUrl}&comp=block&blockid=${encodeURIComponent(blockId)}`;



 await fetch(chunkUrl, {

   method: 'PUT',

   headers: {

     'x-ms-blob-type': 'BlockBlob',

     'x-ms-version': '2020-10-02',

     'Content-Type': file.type

   },

   body: chunk

 });

}

```



---



### 🧱 Zakończenie uploadu – `PutBlockList`



Po wysłaniu wszystkich bloków należy zakończyć upload przez przesłanie listy blocków:



```js

const blockListXml = `

<BlockList>

 ${blockIds.map(id => `<Latest>${id}</Latest>`).join('')}

</BlockList>

`;



await fetch(`${uploadUrl}&comp=blocklist`, {

 method: 'PUT',

 headers: {

   'x-ms-version': '2020-10-02',

   'Content-Type': 'application/xml'

 },

 body: blockListXml

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

 "fileName": "video.mp4",

 "mimeType": "video/mp4",

 "size": 4294967296,

 "blobUri": "https://twojstorage.blob.core.windows.net/container/video.mp4",

 "uploadTimestamp": "2025-07-29T18:00:00Z"

}

```



- Pole `userId` nie jest wymagane – backend pobierze je z JWT.



---

---

## 📄 4. Pobieranie listy plików użytkownika

Po zalogowaniu użytkownik może pobrać listę wszystkich swoich plików zapisanych w bazie (metadane).

### Endpoint:

```

GET /api/files

```

### Odpowiedź:
```json
[
  {
    "id": "8f3d1e5a-0b1c-4a6f-9f89-2d12a8ffb64f",
    "fileName": "video.mp4",
    "mimeType": "video/mp4",
    "size": 4294967296,
    "uploadTimestamp": "2025-07-29T18:00:00Z",
    "blobUri": "https://twojstorage.blob.core.windows.net/container/video.mp4"
  },
  {
    "id": "1c2d3e4f-5a6b-7c8d-9e0f-1a2b3c4d5e6f",
    "fileName": "photo.jpg",
    "mimeType": "image/jpeg",
    "size": 204800,
    "uploadTimestamp": "2025-07-30T10:15:00Z",
    "blobUri": "https://twojstorage.blob.core.windows.net/container/photo.jpg"
  }
]
```
---

## 📥 5. Pobranie pliku z metadanymi i linkiem SAS

Po kliknięciu w plik na liście, frontend może pobrać szczegółowe informacje o pliku oraz tymczasowy link do pobrania z Azure (SAS URL).
Link wygasa po określonym czasie (np. 10 minut).

### Endpoint:

```

GET /api/files/{id}

```

{id} – identyfikator pliku z bazy (pole id z listy plików).

### Odpowiedź:
```json
[
  {
  "id": "8f3d1e5a-0b1c-4a6f-9f89-2d12a8ffb64f",
  "fileName": "video.mp4",
  "mimeType": "video/mp4",
  "size": 4294967296,
  "uploadTimestamp": "2025-07-29T18:00:00Z",
  "downloadUrl": "https://twojstorage.blob.core.windows.net/container/video.mp4?...sasToken...",
  "expiresInSeconds": 600
}
]
```
Jak użyć downloadUrl:
Możesz wstawić go bezpośrednio jako src w ```<video>```, ```<img>```, ```<audio>``` lub pobrać go przez fetch/axios.

Przykład – odtworzenie wideo:

```
<video controls src="{downloadUrl}"></video>
```
Przykład – pobranie pliku w JS:
```
window.location.href = downloadUrl;
```

Ważne: Po wygaśnięciu linku (expiresInSeconds) trzeba ponownie wywołać ten endpoint, aby pobrać nowy SAS URL.


## ℹ️ Uwagi końcowe



- Wszystkie pliki uploadowane są **bezpośrednio do Azure**, bez obciążania backendu.

- Backend:

 - generuje bezpieczny link SAS do uploadu

 - przyjmuje metadane po zakończeniu

- Frontend:

 - wysyła plik (PUT)

 - w przypadku dużych – dzieli plik i wysyła chunkami

 - kończy upload przez `PutBlockList`

 - wywołuje endpoint `/commit`



---



## 🛠️ Debugowanie



- Jeśli plik nie pojawia się w Azure: upewnij się, że użyto `PutBlockList`.

- Jeśli metadane się nie zapisują – sprawdź token JWT i czy commit został poprawnie wysłany.



