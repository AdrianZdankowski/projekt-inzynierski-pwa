using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using backend.Contexts;
using Microsoft.IdentityModel.Tokens;

namespace backend.Services
{
    public class FileAccessValidator(UserContext context,IConfiguration config) : IFileAccessValidator
    {
        public async Task<bool> ValidateUserAccess(Guid userId, WebApplication1.File video)
        {

            //var user = await GetUserFromJwt(accessToken);


            if (video.UserId.Equals(userId))
            {
                return true;
            }

            var fileAccess = context.FileAccesses.FirstOrDefault(f => f.file.id == video.id && f.user.id == userId);
            if (fileAccess != null)
            {
                return true;
            }

            return false;
        }
        private async Task<WebApplication1.User> GetUserFromJwt(string accessToken)
        {
            //todo: refactor this function and one in authService
            if (string.IsNullOrEmpty(accessToken)) return null;

            var tokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidIssuer = config["AppSettings:JwtIssuer"],
                ValidateAudience = true,
                ValidAudience = config["AppSettings:JwtAudience"],
                ValidateLifetime = true,
                IssuerSigningKey = new SymmetricSecurityKey(
               Encoding.UTF8.GetBytes(config["AppSettings:JwtSecret"]!)),
                ValidateIssuerSigningKey = true
            };

            var tokenHandler = new JwtSecurityTokenHandler();

            var principal = tokenHandler.ValidateToken(accessToken, tokenValidationParameters, out SecurityToken securityToken);
            var jwtSecurityToken = securityToken as JwtSecurityToken;

            if (jwtSecurityToken == null || !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha512, StringComparison.InvariantCultureIgnoreCase))
            {
                throw new SecurityTokenException("Invalid Token");
            }

            //extract user id from JWT
            var handler = new JwtSecurityTokenHandler();
            var jwt = handler.ReadJwtToken(accessToken);

            var userIdString = jwt.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;
            Guid userId = Guid.Parse(userIdString);

            //get user from db, and check refresh token
            var user = await context.Users.FindAsync(userId);

            return user;
        }
    }
}
