using backend;
using Microsoft.AspNetCore.Identity;
using WebApplication1;

public static class DbSeeder
{
    public static async Task SeedSuperAdminAsync(AppDbContext context)
    {
        if (!context.Users.Any())
        {
            var user = new User
            {
                id = Guid.NewGuid(),
                username = "superadmin",
                passwordHash = new PasswordHasher<User>().HashPassword(null!, "Password123!"),
                email = "admin@example.com",
                role = Role.Admin,
                refreshToken = null,
                refreshTokenExpiry = null
            };

            context.Users.Add(user);
            await context.SaveChangesAsync();
        }
    }
}
