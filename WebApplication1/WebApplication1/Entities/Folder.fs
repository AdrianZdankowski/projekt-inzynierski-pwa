namespace WebApplication1
open System
open System.ComponentModel.DataAnnotations

[<AllowNullLiteral>]
type Folder(owner: Guid, name: string) =

    [<Key>]
    let id = Guid.NewGuid()
    let mutable files: File list = []
    member this.owner = owner
    member this.name = name

    member this.AddFile(file: File) =
        files <- file :: files

    member this.DeleteFile(fileId: Guid) =
        files <- files |> List.filter (fun f -> f.id <> fileId)
