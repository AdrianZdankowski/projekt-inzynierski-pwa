namespace WebApplication1

open System
open System.ComponentModel.DataAnnotations

type Role =
    | Admin
    | User
    with
        member this.ToStringValue() =
            match this with
            | Admin -> "Admin"
            | User -> "User"

        static member FromString (str: string) =
            match str with
            | "Admin" -> Admin
            | "User" -> User
            | other -> failwith "Invalid role"

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
    
    role : Role
    }
    //member this.AddFile file =
      //  ownedFiles <- file :: ownedFiles

    //member this.AddFolder folder =
        //ownedFolders <- folder :: ownedFolders
