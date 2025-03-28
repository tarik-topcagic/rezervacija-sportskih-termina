using System.ComponentModel.DataAnnotations;

namespace SportskiTerminiAPI.DTOs
{
    public class UpdateGroupDto
    {
        [Required]
        public string Name { get; set; }
        public string Description { get; set; }
        public string? GroupPictureUrl { get; set; } = string.Empty;
    }
}
