namespace WebApplication1

open System

type User(id:Guid, username:string, password:string, email:string) =
    let mutable ownedFiles: File list = []
    let mutable ownedFolders: Folder list = []

    member this.id = id
    member this.username = username
    member this.password = password
    member this.email = email
    
    member this.AddFile file =
        ownedFiles <- file :: ownedFiles

    member this.AddFolder folder =
        ownedFolders <- folder :: ownedFolders
