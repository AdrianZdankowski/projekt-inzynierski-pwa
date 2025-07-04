using System.Threading.Tasks;
using backend.DTO;
using backend.DTO.User;
using backend.Services;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using WebApplication1;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[Controller]")]
    public class AuthController(IAuthService authService) : ControllerBase
    {

        [HttpPost("register")]
        public async Task<ActionResult<User>> Register(UserDto request)
        {
            var user = await authService.RegisterAsync(request);
            if (user == null)
            {
                return BadRequest("User with given usernmane already exist");
            }
            return Ok();
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthTokensDto>> Login(UserDto request)
        {
            var result = await authService.LoginAsync(request);
            if (result == null)
            {
                return BadRequest("Wrong username or password");
            }
            return Ok(result);
        }

        [HttpPost("refresh-token")]
        public async Task<ActionResult<AuthTokensDto>> RefreshToken(RefreshRequestDto request)
        {
            var result = await authService.RefreshTokensAsync(request.RefreshToken);
            if (result == null || result.AccessToken == null || result.RefreshToken == null)
            {
                return Unauthorized("Invalid refresh token");
            }
            return Ok(result);
        }
        [HttpPost("logout")]
        public async Task<ActionResult<AuthTokensDto>> Logout(LogoutRequestDto request)
        {
            var result = await authService.LogoutAsync(request.accessToken);
            if (result == null)
            {
                return BadRequest();
            }
            return Ok();
        }
    }
}
