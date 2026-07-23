namespace SportskiTerminiAPI.Models
{
    public class PrivateMessage
    {
        public int Id { get; set; }
        public int ConversationId { get; set; }
        public string SenderUserId { get; set; } = string.Empty;
        public string MessageText { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? DeliveredAt { get; set; }
        public DateTime? SeenAt { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime? DeletedAt { get; set; }
        public bool IsPinned { get; set; }
        public DateTime? PinnedAt { get; set; }
        public int? ReplyToMessageId { get; set; }
        public virtual PrivateConversation Conversation { get; set; } = null!;
        public virtual AppUser SenderUser { get; set; } = null!;
        public virtual PrivateMessage? ReplyToMessage { get; set; }
        public virtual ICollection<PrivateMessageReaction> Reactions { get; set; } = new List<PrivateMessageReaction>();
    }
}
