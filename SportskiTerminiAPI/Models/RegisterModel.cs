using System.ComponentModel.DataAnnotations;

namespace SportskiTerminiAPI.Models
{
    public class RegisterModel
    {
        [Required(ErrorMessage = "Full name is required.")]
        public string FullName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Email is required."), EmailAddress(ErrorMessage = "Invalid email")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Phone number is required."), RegularExpression("^\\+387[0-9]{8,9}$", ErrorMessage = "Invalid phone number format")]
        public string PhoneNumber { get; set; } = string.Empty;

        [Required(ErrorMessage = "Username is required.")]
        [MinLength(4, ErrorMessage = "Username must be at least 4 characters long.")]
        public string Username { get; set; } = string.Empty;

        [Required(ErrorMessage = "Password is required.")]
        [RegularExpression("^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{6,}$",
            ErrorMessage = "Password must have at least 6 characters, a letter, a number and a special sign.")]
        public string Password { get; set; } = string.Empty;
    }
}
