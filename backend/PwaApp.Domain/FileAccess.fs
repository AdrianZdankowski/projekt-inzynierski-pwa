namespace WebApplication1

open System
open System.ComponentModel.DataAnnotations

[<CLIMutable>]
type FileAccess = 
    {
        [<Key>]
        id : Guid

        [<Required>]
        file : File
        
        [<Required>]
        user : User
}