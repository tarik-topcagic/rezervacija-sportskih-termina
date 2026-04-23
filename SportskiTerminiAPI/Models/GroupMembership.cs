using System.Text.Json.Serialization;

namespace SportskiTerminiAPI.Models
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum MembershipStatus
    {
        PendingJoinRequest = 0,
        PendingInvitation = 1,
        Accepted = 2,
        Declined = 3
    }
    public class GroupMembership
    {
        public int Id { get; set; }
        public int GroupId { get; set; }
        public string UserId { get; set; } = string.Empty;
        public MembershipStatus Status { get; set; } = MembershipStatus.PendingJoinRequest;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
        public DateTime? RespondedAt { get; set; }
        public virtual Group group { get; set; } = null!;
        public virtual AppUser User { get; set; } = null!;
    }
}
