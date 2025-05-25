namespace WebApplication1
open Microsoft.EntityFrameworkCore


type UserContext(options: DbContextOptions<UserContext>)=
    inherit DbContext(options)

    [<DefaultValue>]
    val mutable users: DbSet<User>
    member this.Users with get() = this.users and set v = this.users <- v

    [<DefaultValue>]
    val mutable files: DbSet<File>
    member this.Files with get() = this.Files and set v = this.Files <- v

    [<DefaultValue>]
    val mutable folders: DbSet<Folder>
    member this.Folders with get() = this.Folders and set v = this.Folders <- v