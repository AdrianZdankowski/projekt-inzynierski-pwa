using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using backend.Data;
using backend.DTO;
using backend.DTO.User;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using PwaApp.Application.Interfaces;
using WebApplication1;

namespace backend.Services
{
    public class AuthService(IAppDbContext context, IConfiguration configuration) : IAuthService
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
            user.refreshTokenExpiry = DateTime.UtcNow;
            await context.SaveChangesAsync();

            return user;
        }

        public async Task<AccessTokenDto?> RefreshTokensAsync(string refreshToken)
        {
            var user = await ValidateRefreshTokenAsync(refreshToken);

            if (user == null)
            {
                return null;
            }

            var response = new AccessTokenDto
            {
                AccessToken = CreateToken(user),
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
                new Claim(ClaimTypes.Role, user.role.ToStringValue()),
                new Claim("type", "access")
            };
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration.GetValue<string>("AppSettings:JwtSecret")!));

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512);

            var token = new JwtSecurityToken(
                issuer: configuration.GetValue<string>("AppSettings:JwtIssuer"),
                audience: configuration.GetValue<string>("AppSettings:JwtAudience"),
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(30),
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

        private string HashToken(string token)
        {
            using var sha256 = SHA256.Create();
            var bytes = Encoding.UTF8.GetBytes(token);
            var hashBytes = sha256.ComputeHash(bytes);
            return Convert.ToBase64String(hashBytes);
        }

        private async Task<string> SetRefreshTokenAsync(User user)
        {
            var refreshToken = GenerateRefreshToken();
            user.refreshToken = HashToken(refreshToken);
            user.refreshTokenExpiry = DateTime.UtcNow.AddDays(7);
            await context.SaveChangesAsync();

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.id.ToString()),
                new Claim("refresh", refreshToken),
                new Claim("type", "refresh")
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration.GetValue<string>("AppSettings:JwtSecret")!));

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512);

            var token = new JwtSecurityToken(
                issuer: configuration.GetValue<string>("AppSettings:JwtIssuer"),
                audience: configuration.GetValue<string>("AppSettings:JwtAudience"),
                claims: claims,
                expires: user.refreshTokenExpiry,
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private async Task<User?> ValidateRefreshTokenAsync(string refreshToken)
        {
            if (string.IsNullOrEmpty(refreshToken)) return null;

            var tokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidIssuer = configuration["AppSettings:JwtIssuer"],
                ValidateAudience = true,
                ValidAudience = configuration["AppSettings:JwtAudience"],
                ValidateLifetime = true,
                IssuerSigningKey = new SymmetricSecurityKey(
               Encoding.UTF8.GetBytes(configuration["AppSettings:JwtSecret"]!)),
                ValidateIssuerSigningKey = true
            };

            var tokenHandler = new JwtSecurityTokenHandler();

            var principal = tokenHandler.ValidateToken(refreshToken, tokenValidationParameters, out SecurityToken securityToken);
            var jwtSecurityToken = securityToken as JwtSecurityToken;

            if (jwtSecurityToken == null || !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha512, StringComparison.InvariantCultureIgnoreCase))
            {
                throw new SecurityTokenException("Invalid Token");
            }

            //extract user id and refresh token from JWT
            var handler = new JwtSecurityTokenHandler();
            var jwt = handler.ReadJwtToken(refreshToken);

            var userIdString = jwt.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;
            Guid userId = Guid.Parse(userIdString);
            var refreshString = jwt.Claims.FirstOrDefault(c => c.Type == "refresh")?.Value;


            //get user from db, and check refresh token
            var user = await context.Users.FindAsync(userId);

            if (user == null || user.refreshToken == null || user.refreshToken != HashToken(refreshString) || user.refreshTokenExpiry <= DateTime.UtcNow)
            {
                return null;
            }
            return user;
        }
    }
}
