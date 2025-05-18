namespace WebApplication1

open System

//- id:UUID
//- size:int
//- name:String
//-extension:String
//-creationTimestamp:datetime
//-path:String

//+ uploadFile(params):void
//+ downloadFile(fileId:UUID):void
//+ deleteFile(params):void
//+editFile(params):void
//+<<abstract>>display():void
//+<<abstract>>displayThumbnail():void

[<AbstractClass>]
type File(id: System.Guid, size: int, name: String, extension: String, creationTimestamp: DateTime, path: String) =

    let mutable size, name, extension, path = size, name, extension, path;
    member this.id = id;
    member this.creationTimestamp = creationTimestamp;

    
    abstract display: float with get
    abstract displayThumbnail: float with get

    member this.Size
        with get() = size
        and set(value) = size <- value

    member this.Name
        with get() = name
        and set(value) = name <- value

    member this.Extension
        with get() = extension
        and set(value) = extension <- value

    member this.Path
        with get() = path
        and set(value) = path <- value

    
    member this.UploadFile(params: string) =
        printfn "TODO" 

    member this.DownloadFile(fileID: System.Guid) =
        printfn "TODO"

    member this.DeleteFile(params: string) =
        printfn "TODO"

    member this.EditFile(params: string) =
        printfn "TODO"

    abstract member Display : unit -> unit
    abstract member DisplayThumbnail : unit -> unit
