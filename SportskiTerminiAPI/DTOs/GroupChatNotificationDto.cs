namespace SportskiTerminiAPI.DTOs
{
    public class GroupChatNotificationDto
    {
        public int GroupId { get; set; }
        public string GroupName { get; set; } = string.Empty;
        public string? GroupImageUrl { get; set; }
        public string SenderUserId { get; set; } = string.Empty;
        public string SenderName { get; set; } = string.Empty;
        public string SenderProfilePictureUrl { get; set; } = "default-profile.png";
        public string LatestMessagePreview { get; set; } = string.Empty;
        public DateTimeOffset CreatedAt { get; set; }
        public int UnreadCount { get; set; }
        public bool IsRead { get; set; }
    }
}
