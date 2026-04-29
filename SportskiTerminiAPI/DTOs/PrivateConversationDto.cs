namespace SportskiTerminiAPI.DTOs
{
    public class PrivateConversationDto
    {
        public int Id { get; set; }
        public string OtherUserId { get; set; } = string.Empty;
        public string OtherUsername { get; set; } = string.Empty;
        public string OtherFullName { get; set; } = string.Empty;
        public string OtherProfilePictureUrl { get; set; } = "default-profile.png";
        public string? LatestMessagePreview { get; set; }
        public DateTime? LatestMessageCreatedAt { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
