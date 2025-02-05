using System.ComponentModel.DataAnnotations;

namespace SportskiTerminiAPI.Models
{
    public class LoginModel
    {
        [Required(ErrorMessage = "Username is required.")]
        public string Username { get; set; } = string.Empty;

        [Required(ErrorMessage = "Password is required.")]
        [RegularExpression("^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{6,}$",
            ErrorMessage = "Password must have at least 6 characters, a letter, a number and a special sign.")]
        public string Password { get; set; } = string.Empty;
    }
}
