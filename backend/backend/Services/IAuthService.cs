using backend.DTO.User;
using WebApplication1;

namespace backend.Services

{
    public interface IAuthService
    {
        Task<User?> RegisterAsync(UserDto request);
        Task<string?> LoginAsync(UserDto request);
    }
}
