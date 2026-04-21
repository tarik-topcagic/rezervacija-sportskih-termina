using System.ComponentModel.DataAnnotations;

namespace SportskiTerminiAPI.DTOs
{
    public class UpdateUsernameDto
    {
        [Required]
        public string Username { get; set; } = string.Empty;
    }
}
