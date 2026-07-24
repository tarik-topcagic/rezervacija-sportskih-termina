namespace SportsBookingAPI.DTOs
{
    public class PrivateChatNotificationDto
    {
        public int ConversationId { get; set; }
        public string OtherUserId { get; set; } = string.Empty;
        public string OtherUsername { get; set; } = string.Empty;
        public string OtherFullName { get; set; } = string.Empty;
        public string OtherProfilePictureUrl { get; set; } = "default-profile.png";
        public string LatestMessagePreview { get; set; } = string.Empty;
        public DateTimeOffset CreatedAt { get; set; }
        public int UnreadCount { get; set; }
        public bool IsRead { get; set; }
    }
}
