using System.ComponentModel.DataAnnotations;

namespace SportskiTerminiAPI.DTOs
{
    public class CreateReservationDto
    {
        [Required]
        public int ArenaId { get; set; }

        [Required]
        public DateTime StartTime { get; set; }

        [Required]
        [AllowedValues(1.0, 1.5, 2.0)]
        public double DurationInHours { get; set; }

        [Required]
        [RegularExpression(@"^\d{4}$", ErrorMessage = "Card last 4 digits must be exactly 4 digits")]
        public string CardLast4 { get; set; } = string.Empty;
    }
}
