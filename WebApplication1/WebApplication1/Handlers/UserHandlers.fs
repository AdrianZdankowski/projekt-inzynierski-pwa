module WebApplication1.Handlers.UserHandlers

open Microsoft.AspNetCore.Routing
open Microsoft.AspNetCore.Http
open Microsoft.AspNetCore.Builder
open WebApplication1
open System
open Microsoft.EntityFrameworkCore
open System.Collections.Generic
open System.Linq

let configureUserRoutes(app: WebApplication) =
    app.MapPost("/users", Func<UserContext, User, IResult>(fun ctx user ->
        ctx.Users.Add(user) |> ignore
        ctx.SaveChanges() |> ignore
        Results.Created($"/users/{user.id}", user)
        )
    ) |> ignore

    app.MapGet("/users", Func<UserContext, List<User>>(fun ctx ->
        ctx.Users.ToList()
        )
    ) |> ignore

