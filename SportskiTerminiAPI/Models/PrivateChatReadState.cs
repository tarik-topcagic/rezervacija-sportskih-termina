namespace SportskiTerminiAPI.Models
{
    public class PrivateChatReadState
    {
        public int Id { get; set; }
        public int ConversationId { get; set; }
        public string UserId { get; set; } = string.Empty;
        public DateTime LastReadAt { get; set; } = DateTime.UtcNow;

        public virtual PrivateConversation Conversation { get; set; } = null!;
        public virtual AppUser User { get; set; } = null!;
    }
}
