namespace SportskiTerminiAPI.DTOs
{
    public class ChatMessageNotificationDto
    {
        public string Type { get; set; } = string.Empty;
        public int? GroupId { get; set; }
        public int? ConversationId { get; set; }
        public string SenderUserId { get; set; } = string.Empty;
        public string SenderName { get; set; } = string.Empty;
        public string Preview { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}
