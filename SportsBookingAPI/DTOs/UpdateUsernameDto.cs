using System.ComponentModel.DataAnnotations;

namespace SportsBookingAPI.DTOs
{
    public class UpdateUsernameDto
    {
        [Required]
        public string Username { get; set; } = string.Empty;
    }
}
