using System.Security.Claims;
using backend.DTO;
using backend.DTO.User;
using WebApplication1;

namespace backend.Services

{
    public interface IAuthService
    {
        Task<User?> RegisterAsync(UserDto request);
        Task<AuthTokensDto?> LoginAsync(UserDto request);
        Task<AccessTokenDto?> RefreshTokensAsync(string refreshToken, string userId);
        Task<User?> LogoutAsync(string request);
        ClaimsPrincipal GetPrincipalFromExpiredToken(string accessToken);
    }
}
