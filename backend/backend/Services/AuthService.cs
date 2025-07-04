using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using backend.DTO;
using backend.DTO.User;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using WebApplication1;

namespace backend.Services
{
    public class AuthService(UserContext context, IConfiguration configuration) : IAuthService
    {

        public async Task<AuthTokensDto?> LoginAsync(UserDto request)
        {
            var user = await context.Users.FirstOrDefaultAsync(u=>u.username == request.username);
            if (user == null)
            {
                return null;
            }
            if (new PasswordHasher<User>().VerifyHashedPassword(user, user.passwordHash, request.password) == PasswordVerificationResult.Failed)
            {
                return null;
            }

            var response = new AuthTokensDto
            {
                AccessToken = CreateToken(user),
                RefreshToken = await SetRefreshTokenAsync(user)
            };

            return response;
        }

        public async Task<User?> LogoutAsync(string jwtToken)
        {
            //extract user id and refresh token from JWT
            var handler = new JwtSecurityTokenHandler();
            var jwt = handler.ReadJwtToken(jwtToken);

            var userIdString = jwt.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;
            Guid userId = Guid.Parse(userIdString);

            var user = await context.Users.FindAsync(userId);
            if (user == null)
            {
                return null;
            }

            //deleting refreshToken from db
            user.refreshToken = null;
            await context.SaveChangesAsync();

            return user;
        }

        public async Task<AuthTokensDto?> RefreshTokensAsync(string request)
        {
            var user = await ValidateRefreshTokenAsync(request);

            if (user == null)
            {
                return null;
            }

            var response = new AuthTokensDto
            {
                AccessToken = CreateToken(user),
                RefreshToken = await SetRefreshTokenAsync(user)
            };

            return response;
        }

        public async Task<User?> RegisterAsync(UserDto request)
        {
            if (await context.Users.AnyAsync(u=>u.username == request.username))
            {
                return null;
            }

            var user = new User();
            var hashedPassword = new PasswordHasher<User>()
                .HashPassword(user, request.password);

            user.username = request.username;
            user.passwordHash = hashedPassword;
            user.role = Role.User;

            context.Users.Add(user);
            await context.SaveChangesAsync();

            return user;
        }

        private string CreateToken(User user)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, user.username),
                new Claim(ClaimTypes.NameIdentifier, user.id.ToString()),
                new Claim(ClaimTypes.Role, user.role.ToStringValue())
            };
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration.GetValue<string>("AppSettings:JwtSecret")!));

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512);

            var token = new JwtSecurityToken(
                issuer: configuration.GetValue<string>("AppSettings:JwtIssuer"),
                audience: configuration.GetValue<string>("AppSettings:JwtAudience"),
                claims: claims,
                expires: DateTime.UtcNow.AddDays(1),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private string GenerateRefreshToken()
        {
            var randomNumber = new byte[32];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(randomNumber);
            }
            var refreshToken = Convert.ToBase64String(randomNumber);
            return refreshToken;
        }

        private async Task<string> SetRefreshTokenAsync(User user)
        {
            var refreshToken = GenerateRefreshToken();
            user.refreshToken = refreshToken;
            user.refreshTokenExpiry = DateTime.UtcNow.AddDays(7);
            await context.SaveChangesAsync();

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.id.ToString()),
                new Claim("refresh", refreshToken)
            };

            var token = new JwtSecurityToken(
                claims: claims,
                expires: user.refreshTokenExpiry);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private async Task<User?> ValidateRefreshTokenAsync(string refreshToken)
        {
            //extract user id and refresh token from JWT
            var handler = new JwtSecurityTokenHandler();
            var jwt = handler.ReadJwtToken(refreshToken);

            var userIdString = jwt.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;
            Guid userId = Guid.Parse(userIdString);
            var refresh = jwt.Claims.FirstOrDefault(c => c.Type == "refresh")?.Value;
            

            //get user from db, and check refresh token
            var user = await context.Users.FindAsync(userId);
            if (user == null || user.refreshToken == null || user.refreshToken != refresh || user.refreshTokenExpiry <= DateTime.UtcNow)
            {
                return null;
            }
            return user;
        }
    }
}
