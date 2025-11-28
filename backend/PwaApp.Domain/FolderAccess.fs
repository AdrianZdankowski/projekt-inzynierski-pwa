namespace WebApplication1

open System
open System.ComponentModel.DataAnnotations

[<Flags>]
type PermissionFlags =
    | Create = 1
    | Read = 2
    | Update = 4
    | Delete = 8

//todo: refactor to have one entity for folder and file accesses
[<CLIMutable>]
type FolderAccess = 
    {
        [<Key>]
        id : Guid

        [<Required>]
        folder : Folder
        
        [<Required>]
        user : User

        [<Required>]
        permissions : PermissionFlags
}

module Permissions =
    let hasPermission (required : PermissionFlags) (actual : PermissionFlags) = (int actual &&& int required) = int required