using System.ComponentModel.DataAnnotations;
using backend.Validation;

namespace backend.DTO.User
{
    public class UserDto
    {
        [Required(ErrorMessage = "Username is required")]
        [RegularExpression(@"^[a-zA-Z0-9_.-]{3,32}$",
        ErrorMessage = "Username may contain letters, digits, underscores (_), hyphens (-), and dots (.), and must be between 3 and 32 characters long.")]
        public string username { get; set; }

        [PasswordComplexity(MinimumLength = 8)]
        public string password { get; set; }
    }
}
