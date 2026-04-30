namespace SportskiTerminiAPI.Models
{
    public class GroupMessage
    {
        public int Id { get; set; }
        public int GroupId { get; set; }
        public string SenderUserId { get; set; } = string.Empty;
        public string MessageText { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public virtual Group Group { get; set; } = null!;
        public virtual AppUser SenderUser { get; set; } = null!;
        public virtual ICollection<GroupMessageReceipt> Receipts { get; set; } = new List<GroupMessageReceipt>();
    }
}
