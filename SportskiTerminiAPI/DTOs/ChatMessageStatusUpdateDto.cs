namespace SportskiTerminiAPI.DTOs
{
    public class ChatMessageStatusUpdateDto
    {
        public int MessageId { get; set; }
        public string ChatType { get; set; } = string.Empty;
        public int? GroupId { get; set; }
        public int? ConversationId { get; set; }
        public string UserId { get; set; } = string.Empty;
        public DateTimeOffset? DeliveredAt { get; set; }
        public DateTimeOffset? SeenAt { get; set; }
        public List<string> SeenByUserIds { get; set; } = new();
        public List<string> SeenByUserNames { get; set; } = new();
        public List<string> SeenByUserProfilePictureUrls { get; set; } = new();
    }
}
