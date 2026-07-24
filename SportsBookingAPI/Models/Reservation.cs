using System.Text.Json.Serialization;

namespace SportsBookingAPI.Models
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum ReservationStatus
    {
        Confirmed = 0,
        Cancelled = 1
    }

    public class Reservation
    {
        public int Id { get; set; }
        public int ArenaId { get; set; }
        public string UserId { get; set; } = string.Empty;
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public ReservationStatus Status { get; set; } = ReservationStatus.Confirmed;
        public string? CardLast4 { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? CancelledAt { get; set; }
        public virtual Arena Arena { get; set; } = null!;
        public virtual AppUser User { get; set; } = null!;
    }
}
