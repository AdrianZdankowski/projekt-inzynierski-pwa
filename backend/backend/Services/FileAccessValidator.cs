using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace backend.Services
{
    public class FileAccessValidator(AppDbContext context,IConfiguration config) : IFileAccessValidator
    {
        public async Task<bool> ValidateUserAccess(Guid userId, WebApplication1.File file)
        {

            //var user = await GetUserFromJwt(accessToken);


            if (file.UserId.Equals(userId))
            {
                return true;
            }

            var fileAccess = context.FileAccesses.FirstOrDefault(f => f.file.id == file.id && f.user.id == userId);
            if (fileAccess is not null)
            {
                return true;
            }

            return false;
        }

        public async Task<bool> ValidateDeletePermission(Guid userId, WebApplication1.File file)
        {
            //currently only owner can delete file
            if (file.UserId.Equals(userId))
            {
                return true;
            }

            return false;
        }
    }
}
