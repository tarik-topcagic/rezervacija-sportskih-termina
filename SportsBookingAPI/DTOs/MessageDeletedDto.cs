namespace SportsBookingAPI.DTOs
{
    public class MessageDeletedDto
    {
        public int MessageId { get; set; }
        public int? GroupId { get; set; }
        public int? ConversationId { get; set; }
        public bool IsChatNowEmpty { get; set; }
        public string? UpdatedPreviewText { get; set; }
        public DateTimeOffset? UpdatedPreviewCreatedAt { get; set; }
        public string? UpdatedPreviewSenderUserId { get; set; }
        public string? UpdatedPreviewSenderName { get; set; }
    }
}
