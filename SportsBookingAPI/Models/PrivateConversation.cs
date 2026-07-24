namespace SportsBookingAPI.Models
{
    public class PrivateConversation
    {
        public int Id { get; set; }
        public string UserOneId { get; set; } = string.Empty;
        public string UserTwoId { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public virtual AppUser UserOne { get; set; } = null!;
        public virtual AppUser UserTwo { get; set; } = null!;
        public virtual ICollection<PrivateMessage> PrivateMessages { get; set; } = new List<PrivateMessage>();
    }
}
