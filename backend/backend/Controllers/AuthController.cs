using System.Threading.Tasks;
using backend.DTO.User;
using backend.Services;
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
        public async Task<ActionResult<string>> Login(UserDto request)
        {
            var token = await authService.LoginAsync(request);
            if (token == null)
            {
                return BadRequest("Wrong username or password");
            }
            return Ok(token);
        }
    }
}
