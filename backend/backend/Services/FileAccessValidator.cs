using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using backend.Contexts;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace backend.Services
{
    public class FileAccessValidator(UserContext context,IConfiguration config) : IFileAccessValidator
    {
        public async Task<bool> ValidateUserAccess(Guid userId, WebApplication1.File file)
        {

            //var user = await GetUserFromJwt(accessToken);


            if (file.UserId.Equals(userId))
            {
                return true;
            }

            var fileAccess = context.FileAccesses
                .Include(f => f.file)
                .Include(f => f.user)
                .FirstOrDefault(f => f.file.id == file.id && f.user.id == userId);
            if (fileAccess != null)
            {
                return true;
            }

            return false;
        }
    }
}
