using SportskiTerminiAPI.Models;

namespace SportskiTerminiAPI.DTOs
{
    public class ReservationDto
    {
        public int Id { get; set; }
        public int ArenaId { get; set; }
        public string ArenaName { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public double DurationInHours { get; set; }
        public ReservationStatus Status { get; set; }
        public string? CardLast4 { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? CancelledAt { get; set; }
    }
}
