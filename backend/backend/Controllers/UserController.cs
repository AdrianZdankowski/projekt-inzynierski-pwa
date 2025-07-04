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

        //Todo: change this to registration endpoint, add password hashing and not use id provided by user
        [Authorize]
        [HttpPost(Name = "GetUser")]
        public async Task<IActionResult> AddUser([FromBody] User user)
        {
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetUser), user);
        }
    }
}
