namespace SportsBookingAPI.Models
{
    public class PrivateMessageReaction
    {
        public int Id { get; set; }
        public int PrivateMessageId { get; set; }
        public string UserId { get; set; } = string.Empty;
        public string Emoji { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public virtual PrivateMessage PrivateMessage { get; set; } = null!;
        public virtual AppUser User { get; set; } = null!;
    }
}
