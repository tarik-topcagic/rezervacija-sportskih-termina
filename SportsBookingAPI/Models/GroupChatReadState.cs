namespace SportsBookingAPI.Models
{
    public class GroupChatReadState
    {
        public int Id { get; set; }
        public int GroupId { get; set; }
        public string UserId { get; set; } = string.Empty;
        public DateTime LastReadAt { get; set; } = DateTime.UtcNow;

        public virtual Group Group { get; set; } = null!;
        public virtual AppUser User { get; set; } = null!;
    }
}
