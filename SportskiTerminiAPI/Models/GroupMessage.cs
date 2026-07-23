namespace SportskiTerminiAPI.Models
{
    public class GroupMessage
    {
        public int Id { get; set; }
        public int GroupId { get; set; }
        public string SenderUserId { get; set; } = string.Empty;
        public string MessageText { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public bool IsDeleted { get; set; }
        public DateTime? DeletedAt { get; set; }
        public bool IsPinned { get; set; }
        public DateTime? PinnedAt { get; set; }
        public int? ReplyToMessageId { get; set; }
        public virtual Group Group { get; set; } = null!;
        public virtual AppUser SenderUser { get; set; } = null!;
        public virtual GroupMessage? ReplyToMessage { get; set; }
        public virtual ICollection<GroupMessageReceipt> Receipts { get; set; } = new List<GroupMessageReceipt>();
        public virtual ICollection<GroupMessageReaction> Reactions { get; set; } = new List<GroupMessageReaction>();
    }
}
