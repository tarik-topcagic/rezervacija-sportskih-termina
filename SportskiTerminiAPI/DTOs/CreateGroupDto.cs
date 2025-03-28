using System.ComponentModel.DataAnnotations;

namespace SportskiTerminiAPI.DTOs
{
    public class CreateGroupDto
    {
        [Required]
        public string Name { get; set; }
        public string Description { get; set; }
        public string ImageUrl { get; set; }
    }
}
