namespace WebApplication1

open System
open System.ComponentModel.DataAnnotations

[<AllowNullLiteral>]
type User() =
    
    //let mutable ownedFiles: File list = []
    //let mutable ownedFolders: Folder list = []

    [<Key>]
    member val id = Guid.Empty with get, set
    member val username = "" with get, set
    member val passwordHash = "" with get, set
    member val email = "" with get, set
    
    
    //member this.AddFile file =
      //  ownedFiles <- file :: ownedFiles

    //member this.AddFolder folder =
        //ownedFolders <- folder :: ownedFolders
