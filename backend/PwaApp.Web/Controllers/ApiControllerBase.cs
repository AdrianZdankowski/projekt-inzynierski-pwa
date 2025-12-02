using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace backend.Controllers
{
    [ApiController]
    public abstract class ApiControllerBase : ControllerBase
    {
        protected Guid GetUserIdOrThrow()
        {
            var c = User.Claims.FirstOrDefault(x => x.Type == ClaimTypes.NameIdentifier)?.Value;
            if (!Guid.TryParse(c, out var id))
            {
                throw new UnauthorizedAccessException("Invalid or missing user ID");
            }
            return id;
        }
    }
}

