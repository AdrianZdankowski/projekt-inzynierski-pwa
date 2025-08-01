namespace WebApplication1

open System
open System.ComponentModel.DataAnnotations

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
        BlobUri: string

        UploadTimestamp: DateTime
    }


