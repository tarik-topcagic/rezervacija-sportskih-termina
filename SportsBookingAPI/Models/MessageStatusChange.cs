namespace SportsBookingAPI.Models
{
    public class MessageStatusChange
    {
        public int MessageId { get; set; }
        public string UserId { get; set; } = string.Empty;
        public DateTime? DeliveredAt { get; set; }
        public DateTime? SeenAt { get; set; }
    }
}
