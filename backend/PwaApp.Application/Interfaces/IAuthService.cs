using System.Security.Claims;
using backend.DTO;
using backend.DTO.User;
using WebApplication1;

namespace PwaApp.Application.Interfaces

{
    public interface IAuthService
    {
        Task<User?> RegisterAsync(UserDto request);
        Task<AuthTokensDto?> LoginAsync(UserDto request);
        Task<AccessTokenDto?> RefreshTokensAsync(string refreshToken);
        Task<User?> LogoutAsync(string request);
    }
}
