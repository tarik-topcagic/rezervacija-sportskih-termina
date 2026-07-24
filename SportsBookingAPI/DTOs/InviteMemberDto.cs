using System.ComponentModel.DataAnnotations;

namespace SportsBookingAPI.DTOs
{
    public class InviteMemberDto
    {
        [Required]
        public string UserId { get; set; } = string.Empty;
    }
}
