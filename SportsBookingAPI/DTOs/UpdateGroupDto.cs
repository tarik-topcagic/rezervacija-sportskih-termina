using System.ComponentModel.DataAnnotations;

namespace SportsBookingAPI.DTOs
{
    public class UpdateGroupDto
    {
        [Required]
        public string Name { get; set; }
        public string Description { get; set; }
        [Required]
        public string Grad { get; set; } = string.Empty;
        [Required]
        public string KategorijaSporta { get; set; } = string.Empty;
        public string? GroupPictureUrl { get; set; } = string.Empty;
    }
}
