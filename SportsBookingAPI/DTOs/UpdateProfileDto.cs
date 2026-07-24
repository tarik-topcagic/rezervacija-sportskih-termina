using System.ComponentModel.DataAnnotations;

namespace SportsBookingAPI.DTOs
{
    public class UpdateProfileDto
    {
        public string FullName { get; set; }
        public string? ProfilePictureUrl { get; set; } = string.Empty;

        [RegularExpression("^\\+387[0-9]{8,9}$")]
        public string PhoneNumber { get; set; }
        public string? Location { get; set; } = string.Empty;
    }
}
