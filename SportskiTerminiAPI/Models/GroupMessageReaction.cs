namespace SportskiTerminiAPI.Models
{
    public class GroupMessageReaction
    {
        public int Id { get; set; }
        public int GroupMessageId { get; set; }
        public string UserId { get; set; } = string.Empty;
        public string Emoji { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public virtual GroupMessage GroupMessage { get; set; } = null!;
        public virtual AppUser User { get; set; } = null!;
    }
}
