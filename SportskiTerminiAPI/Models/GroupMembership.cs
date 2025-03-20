using System.Text.Json.Serialization;

namespace SportskiTerminiAPI.Models
{
    public enum MembershipStatus
    {
        Pending,
        Invited,
        Accepted,
        Rejected
    }
    public class GroupMembership
    {
        public int Id { get; set; }
        public int GroupId { get; set; }
        public string UserId { get; set; }
        public MembershipStatus Status { get; set; } = MembershipStatus.Pending;
        public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
        public virtual Group group { get; set; }
        public virtual AppUser User { get; set; }
    }
}
