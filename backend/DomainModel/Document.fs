namespace WebApplication1

open System

type Document(id, size, name, extension, creationTimestamp, path) =
    inherit File(id, size, name, extension, creationTimestamp, path)

    override this.Display() =
        printfn "TODO"

    override this.DisplayThumbnail() =
        printfn "TODO"
