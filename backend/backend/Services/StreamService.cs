
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Azure.Storage.Blobs;
using backend.Contexts;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace backend.Services
{
    public class StreamService(UserContext context, FileContext fileContext, IConfiguration config, IAzureBlobService azureBlobService) : IStreamService
    {
        private readonly string _connectionString = config.GetValue<string>("AzureStorage:ConnectionString")!;
        private readonly string _containerName = config.GetValue<string>("AzureStorage:ContainerName")!;

        private async Task<bool> ValidateUserAccess(string accessToken, WebApplication1.File video)
        {
            //todo: add shared file case 

            var user = await GetUserFromJwt(accessToken);

            if (video.UserId.Equals(user.id))
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

        public async Task<Stream> GetVideo(string accessToken, Guid videoId, string fileName)
        {
            var video = await fileContext.Files.FirstOrDefaultAsync(f => f.id == videoId);

            if (await ValidateUserAccess(accessToken, video) == false)
            {
                throw new UnauthorizedAccessException("User does not have access to this file");
            }
            //var file = GetFile(string.Concat(video.BlobUri, "/files/", fileName));

            //todo: refactor - add method for creating blobNames
            var file = azureBlobService.GetFile(string.Concat(video.UserId, "/", video.FileName, "/", fileName));

            return file.Result;
        }
    }
}
