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
                id = Guid.Parse("C79D1220-76BE-4779-BF70-FB74ADC52E22"),
                UserId = Guid.Parse("0EDDE0A7-4DBE-40B4-7834-08DDFD222C2B"),
                FileName = "gameplay.mp4",
                MimeType = "video/mp4",
                Size = 4294967296,
                BlobName = "0EDDE0A7-4DBE-40B4-7834-08DDFD222C2B/C79D1220-76BE-4779-BF70-FB74ADC52E22/file_example_MP4_1920_18MG.mp4",
                UploadTimestamp = DateTime.Now,
                Status = FileStatus.Uploaded,
                Checksum = "16PezbYoDrDvOgWaw16g7g=="
            };
            
            var jpeg = new WebApplication1.File
            {
                id = Guid.Parse("B905F8DF-6731-49E0-B29E-0B0B8B1680AB"),
                UserId = Guid.Parse("0EDDE0A7-4DBE-40B4-7834-08DDFD222C2B"),
                FileName = "5rx28e7o82rf1.jpeg",
                MimeType = "image/jpeg",
                Size = 147461,
                BlobName = "0edde0a7-4dbe-40b4-7834-08ddfd222c2b/b905f8df-6731-49e0-b29e-0b0b8b1680ab/5rx28e7o82rf1.jpeg",
                UploadTimestamp = DateTime.Now,
                Status = FileStatus.Uploaded,
                Checksum = "nZkvhXS/lqidjTACEdeAkw=="
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
            context.Files.Add(pdf);
            context.Files.Add(gif);
            
            await context.SaveChangesAsync();
        }
    }
}
