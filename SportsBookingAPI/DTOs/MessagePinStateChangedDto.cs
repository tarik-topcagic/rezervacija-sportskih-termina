namespace SportsBookingAPI.DTOs
{
    public class MessagePinStateChangedDto
    {
        public int MessageId { get; set; }
        public int? GroupId { get; set; }
        public int? ConversationId { get; set; }
        public bool IsPinned { get; set; }
        public DateTimeOffset? PinnedAt { get; set; }
    }
}
