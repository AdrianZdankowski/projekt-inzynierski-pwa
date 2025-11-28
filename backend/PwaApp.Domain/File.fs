namespace WebApplication1

open System
open System.ComponentModel.DataAnnotations

type FileStatus =
    | Pending = 0
    | Uploaded = 1
    | Failed = 2
    | Expired = 3

[<CLIMutable>]
type File =
    {
        [<Key>]
        id: Guid

        [<Required>]
        UserId: Guid

        [<Required>]
        FileName: string

        [<Required>]
        MimeType: string

        Size: int64

        [<Required>]
        BlobName: string

        UploadTimestamp: DateTime

        Status: FileStatus

        Checksum: string

        ParentFolder: Folder
    }