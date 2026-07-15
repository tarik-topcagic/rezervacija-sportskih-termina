using System.ComponentModel.DataAnnotations;

namespace SportskiTerminiAPI.DTOs.Admin
{
    public class CreateArenaDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        [Required]
        public string City { get; set; } = string.Empty;
        [Required]
        public string SportType { get; set; } = string.Empty;
        [Required]
        public string Address { get; set; } = string.Empty;
        [Range(0, double.MaxValue)]
        public decimal PricePerHour { get; set; }
    }
}
