namespace SportskiTerminiAPI.DTOs
{
    public class GroupMessageDto
    {
        public int Id { get; set; }
        public int GroupId { get; set; }
        public string SenderUserId { get; set; } = string.Empty;
        public string SenderUsername { get; set; } = string.Empty;
        public string SenderFullName { get; set; } = string.Empty;
        public string SenderProfilePictureUrl { get; set; } = "default-profile.png";
        public string MessageText { get; set; } = string.Empty;
        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset? DeliveredAt { get; set; }
        public DateTimeOffset? SeenAt { get; set; }
        public List<string> SeenByUserIds { get; set; } = new();
        public List<string> SeenByUserNames { get; set; } = new();
        public List<string> SeenByUserProfilePictureUrls { get; set; } = new();
    }
}
