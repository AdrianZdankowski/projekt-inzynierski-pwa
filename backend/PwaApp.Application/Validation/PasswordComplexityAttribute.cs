using System.ComponentModel.DataAnnotations;

namespace backend.Validation
{
    public class PasswordComplexityAttribute : ValidationAttribute
    {
        public int MinimumLength { get; set; } = 8;
        protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
        {
            var password = value as string;

            if (string.IsNullOrWhiteSpace(password))
                return new ValidationResult("Password is required.");

            if (password.Length < MinimumLength)
                return new ValidationResult($"Password must be at least {MinimumLength} characters long.");

            if (!password.Any(char.IsUpper))
                return new ValidationResult("Password must contain at least one uppercase letter.");

            if (!password.Any(char.IsDigit))
                return new ValidationResult("Password must contain at least one digit.");

            if (!password.Any(ch => !char.IsLetterOrDigit(ch)))
                return new ValidationResult("Password must contain at least one special character.");

            return ValidationResult.Success;
        }
    }
}
