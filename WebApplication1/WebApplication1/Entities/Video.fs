namespace WebApplication1

open System

type Video(id, size, name, extension, creationTimestamp, path, duration, resolution) =
    inherit File(id, size, name, extension, creationTimestamp, path)

    let durationInSeconds = duration;

    //Todo: check if we can delete this
    //let resolution = resolution;

    member this.duration = durationInSeconds;
    member this.resolution = resolution;

    override this.Display() =
        printfn "TODO"

    override this.DisplayThumbnail() =
        printfn "TODO"
