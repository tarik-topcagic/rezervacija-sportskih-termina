namespace SportskiTerminiAPI.Models
{
    public class GroupMessageReceipt
    {
        public int Id { get; set; }
        public int GroupMessageId { get; set; }
        public string UserId { get; set; } = string.Empty;
        public DateTime? DeliveredAt { get; set; }
        public DateTime? SeenAt { get; set; }
        public virtual GroupMessage GroupMessage { get; set; } = null!;
        public virtual AppUser User { get; set; } = null!;
    }
}
