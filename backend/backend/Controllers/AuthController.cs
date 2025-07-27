using System.Threading.Tasks;
using backend.DTO;
using backend.DTO.User;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
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

            Response.Cookies.Append("refreshToken", result.RefreshToken, new CookieOptions
            {
                HttpOnly = true,
                SameSite = SameSiteMode.Strict,
                Expires = DateTime.UtcNow.AddDays(7)
            });

            return Ok(new AccessTokenDto { AccessToken = result.AccessToken });
        }

        [HttpPost("refresh-token")]
        public async Task<ActionResult<AuthTokensDto>> RefreshToken()
        {
            var existRefreshToken = Request.Cookies.TryGetValue("refreshToken", out var refreshToken);

            if (existRefreshToken == false)
            {
                return BadRequest();
            }

            var result = await authService.RefreshTokensAsync(refreshToken);

            if (result == null || result.AccessToken == null)
            {
                return Unauthorized("Invalid refresh token");
            }


            return Ok(new AccessTokenDto { AccessToken = result.AccessToken });
        }
        [Authorize]
        [HttpPost("logout")]
        public async Task<ActionResult<AuthTokensDto>> Logout()
        {
            var token = Request.Headers.Authorization.ToString();

            if (string.IsNullOrEmpty(token) && !token.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest();
            }
            token = token["Bearer ".Length..].Trim();

            var result = await authService.LogoutAsync(token);

            if (result == null)
            {
                return BadRequest();
            }

            Response.Cookies.Delete("refreshToken", new CookieOptions
            {
                HttpOnly = true,
                SameSite = SameSiteMode.Strict
            });

            return Ok();
        }
    }
}
