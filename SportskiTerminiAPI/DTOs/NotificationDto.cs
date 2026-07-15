using SportskiTerminiAPI.Models;

namespace SportskiTerminiAPI.DTOs
{
    public class NotificationDto
    {
        public int Id { get; set; }
        public AppNotificationType Type { get; set; }
        public string Username { get; set; } = string.Empty;
        public string? ActorUserId { get; set; }
        public string? ActorName { get; set; }
        public int? GroupId { get; set; }
        public string? GroupName { get; set; }
        public int? MembershipId { get; set; }
        public MembershipStatus? InvitationStatus { get; set; }
        public MembershipStatus? MembershipStatus { get; set; }
        public int? ReservationId { get; set; }
        public int? ArenaId { get; set; }
        public string? ArenaName { get; set; }
        public DateTimeOffset? ReservationStartTime { get; set; }
        public bool IsRead { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
    }
}
