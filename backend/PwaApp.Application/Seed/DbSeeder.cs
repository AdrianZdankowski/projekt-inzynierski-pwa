using backend;
using backend.Data;
using Microsoft.AspNetCore.Identity;
using WebApplication1;

public static class DbSeeder
{
    public static async Task SeedSuperAdminAsync(IAppDbContext context)
    {
        if (!context.Users.Any())
        {
            var admin = new User
            {
                id = Guid.NewGuid(),
                username = "superadmin",
                passwordHash = new PasswordHasher<User>().HashPassword(null!, "Password123!"),
                email = "admin@example.com",
                role = Role.Admin,
                refreshToken = null,
                refreshTokenExpiry = null
            };

            var testUser = new User
            {
                id = Guid.Parse("0EDDE0A7-4DBE-40B4-7834-08DDFD222C2B"),
                username = "test",
                passwordHash = "AQAAAAIAAYagAAAAEHyF7EAsIUCzkmS/4gO0MYS1wY2IjFnAFtW/xGEnHaToEu1HYVSa6lfYGIOaEBVKNQ==",
                email = null,
                role = Role.User,
                refreshToken = null,
                refreshTokenExpiry = null
            };

            var video = new WebApplication1.File
            {
                id = Guid.Parse("8762AA99-5D4F-4880-9947-8F40E723EBA5"),
                UserId = Guid.Parse("0EDDE0A7-4DBE-40B4-7834-08DDFD222C2B"),
                FileName = "gameplay.mp4",
                MimeType = "video/mp4",
                Size = 228283152,
                BlobName = "0edde0a7-4dbe-40b4-7834-08ddfd222c2b/8762aa99-5d4f-4880-9947-8f40e723eba5/gameplay.mp4",
                UploadTimestamp = DateTime.Now,
                Status = FileStatus.Uploaded,
                Checksum = "16PezbYoDrDvOgWaw16g7g=="
            };
            
            var jpeg = new WebApplication1.File
            {
                id = Guid.Parse("A53E45AF-8794-41DE-80C8-C7065F8E34DE"),
                UserId = Guid.Parse("0EDDE0A7-4DBE-40B4-7834-08DDFD222C2B"),
                FileName = "budynek-vuitton-nyc-2025.jpg",
                MimeType = "image/jpeg",
                Size = 300407,
                BlobName = "0edde0a7-4dbe-40b4-7834-08ddfd222c2b/a53e45af-8794-41de-80c8-c7065f8e34de/budynek-vuitton-nyc-2025.jpg",
                UploadTimestamp = DateTime.Now,
                Status = FileStatus.Uploaded,
                Checksum = "En+BXy7UpcCgeWXoS3y+uQ=="
            };
            
            var pdf = new WebApplication1.File
            {
                id = Guid.Parse("044C8C3E-4318-4576-86A3-7027FA90B00E"),
                UserId = Guid.Parse("0EDDE0A7-4DBE-40B4-7834-08DDFD222C2B"),
                FileName = "file-example_PDF_500_kB.pdf",
                MimeType = "application/pdf",
                Size = 469513,
                BlobName = "0edde0a7-4dbe-40b4-7834-08ddfd222c2b/044c8c3e-4318-4576-86a3-7027fa90b00e/file-example_PDF_500_kB.pdf",
                UploadTimestamp = DateTime.Now,
                Status = FileStatus.Uploaded,
                Checksum = "x9NU/xDIaHUvGwMuWw5V6A=="
            };

            var xlsx = new WebApplication1.File
            {
                id = Guid.Parse("D0ED73E5-0321-4C58-8CAB-DBC47E521F34"),
                UserId = Guid.Parse("0EDDE0A7-4DBE-40B4-7834-08DDFD222C2B"),
                FileName = "file_example_XLSX_50.xlsx",
                MimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                Size = 7360,
                BlobName = "0edde0a7-4dbe-40b4-7834-08ddfd222c2b/d0ed73e5-0321-4c58-8cab-dbc47e521f34/file_example_XLSX_50.xlsx",
                UploadTimestamp = DateTime.Now,
                Status = FileStatus.Uploaded,
                Checksum = "XCVvLeVxJsrFrGKc5CynVA=="
            };

            var docx = new WebApplication1.File
            {
                id = Guid.Parse("316C3283-E66A-40C3-8F5B-E4C082BA5CFD"),
                UserId = Guid.Parse("0EDDE0A7-4DBE-40B4-7834-08DDFD222C2B"),
                FileName = "word-sample.docx",
                MimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                Size = 551820,
                BlobName = "0edde0a7-4dbe-40b4-7834-08ddfd222c2b/316c3283-e66a-40c3-8f5b-e4c082ba5cfd/word-sample.docx",
                UploadTimestamp = DateTime.Now,
                Status = FileStatus.Uploaded,
                Checksum = "1FBMkbBwTq7wyNCY1NOWbA=="
            };

            var gif = new WebApplication1.File
            {
                id = Guid.Parse("7905CE21-8A62-4AAA-91C1-01E388F6FB19"),
                UserId = Guid.Parse("0EDDE0A7-4DBE-40B4-7834-08DDFD222C2B"),
                FileName = "rock-one-eyebrow-raised-rock-staring.gif",
                MimeType = "image/gif",
                Size = 1450809,
                BlobName = "0edde0a7-4dbe-40b4-7834-08ddfd222c2b/7905ce21-8a62-4aaa-91c1-01e388f6fb19/rock-one-eyebrow-raised-rock-staring.gif",
                UploadTimestamp = DateTime.Now,
                Status = FileStatus.Uploaded,
                Checksum = "FuljZycHn52dZxoqZCXMAw=="
            };
            
            context.Users.Add(testUser);
            context.Users.Add(admin);
            
            context.Files.Add(video);
            context.Files.Add(jpeg);
            context.Files.Add(xlsx);
            context.Files.Add(docx);
            context.Files.Add(pdf);
            context.Files.Add(gif);
            
            await context.SaveChangesAsync();
        }
    }
}
