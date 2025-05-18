namespace WebApplication1

open System

type Audio(id, size, name, extension, creationTimestamp, path, duration) =
    inherit File(id, size, name, extension, creationTimestamp, path)

    let durationInSeconds = duration;

    member this.duration = durationInSeconds;

    override this.Display() =
        printfn "TODO"

    override this.DisplayThumbnail() =
        printfn "TODO"
