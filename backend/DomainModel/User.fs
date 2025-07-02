namespace WebApplication1

open System
open System.ComponentModel.DataAnnotations

[<CLIMutable>]
type User =
    {
    //let mutable ownedFiles: File list = []
    //let mutable ownedFolders: Folder list = []

    [<Key>]
    id : Guid

    [<Required>]
    username : string

    [<Required>]
    passwordHash : string

    email : string

    refreshToken : string

    refreshTokenExpiry : Nullable<DateTime>
    
    }
    //member this.AddFile file =
      //  ownedFiles <- file :: ownedFiles

    //member this.AddFolder folder =
        //ownedFolders <- folder :: ownedFolders
