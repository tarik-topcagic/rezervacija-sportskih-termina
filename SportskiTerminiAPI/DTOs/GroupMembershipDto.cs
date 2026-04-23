using SportskiTerminiAPI.Models;

namespace SportskiTerminiAPI.DTOs
{
    public class GroupMembershipDto
    {
        public int Id { get; set; }
        public int GroupId { get; set; }
        public string UserId { get; set; } = string.Empty;
        public string? Username { get; set; }
        public string? FullName { get; set; }
        public MembershipStatus Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime JoinedAt { get; set; }
        public DateTime? RespondedAt { get; set; }
    }
}
