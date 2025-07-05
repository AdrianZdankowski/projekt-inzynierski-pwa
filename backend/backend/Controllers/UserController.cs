using backend.DTO.User;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using WebApplication1;

namespace backend.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class UserController : ControllerBase
    {
        private readonly UserContext _context;
        public UserController(UserContext context) 
        {
            _context = context;
        }

        [Authorize(Roles = "Admin")]
        [HttpGet(Name = "GetUser")]
        public async Task<IActionResult> GetUser()
        {
            var users = await _context.Users
                .Select(u=> new UserInfoDto
                {
                    Id = u.id,
                    Name = u.username
                })
                .ToListAsync();

            return Ok(users);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost(Name = "GetUser")]
        public async Task<IActionResult> AddUser([FromBody] User user)
        {
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetUser), user);
        }
    }
}
