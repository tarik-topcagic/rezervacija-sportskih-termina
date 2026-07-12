using System.Text.Json.Serialization;

namespace SportskiTerminiAPI.Models
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum AppNotificationType
    {
        GroupInvitationReceived = 0,
        GroupInvitationAccepted = 1,
        GroupJoinRequestReceived = 2,
        GroupJoinRequestAccepted = 3,
        ReservationReminder1Hour = 4,
        ReservationReminder30Minutes = 5
    }

    public class AppNotification
    {
        public int Id { get; set; }
        public string UserId { get; set; } = string.Empty;
        public string? ActorUserId { get; set; }
        public int? GroupId { get; set; }
        public int? MembershipId { get; set; }
        public int? ReservationId { get; set; }
        public AppNotificationType Type { get; set; }
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ReadAt { get; set; }

        public virtual AppUser User { get; set; } = null!;
        public virtual AppUser? ActorUser { get; set; }
        public virtual Group? Group { get; set; }
        public virtual GroupMembership? Membership { get; set; }
        public virtual Reservation? Reservation { get; set; }
    }
}
