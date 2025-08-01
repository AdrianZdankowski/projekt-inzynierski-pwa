namespace WebApplication1

open System
open System.ComponentModel.DataAnnotations

type Image =
    {
        File: File
        Width: int
        Height: int
    }