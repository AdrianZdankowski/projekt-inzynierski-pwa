namespace WebApplication1
open System
open System.ComponentModel.DataAnnotations

[<CLIMutable>]
type Folder =
    {
        [<Key>]
        id: Guid

        [<Required>]
        OwnerId: Guid

        [<Required>]
        FolderName: string

        CreatedDate: DateTime

        ParentFolder: Folder
    }
