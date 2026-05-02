namespace SportskiTerminiAPI.DTOs
{
    public class ChatTypingDto
    {
        public string UserId { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string TargetId { get; set; } = string.Empty;
    }
}
