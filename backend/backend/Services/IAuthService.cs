using backend.DTO;
using backend.DTO.User;
using WebApplication1;

namespace backend.Services

{
    public interface IAuthService
    {
        Task<User?> RegisterAsync(UserDto request);
        Task<AuthTokensDto?> LoginAsync(UserDto request);
        Task<AccessTokenDto?> RefreshTokensAsync(string request);
        Task<User?> LogoutAsync(string request);
    }
}
