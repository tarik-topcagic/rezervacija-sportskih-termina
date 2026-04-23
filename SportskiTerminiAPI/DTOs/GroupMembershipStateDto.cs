using SportskiTerminiAPI.Models;

namespace SportskiTerminiAPI.DTOs
{
    public class GroupMembershipStateDto
    {
        public int GroupId { get; set; }
        public string UserId { get; set; } = string.Empty;
        public int MembershipId { get; set; }
        public MembershipStatus Status { get; set; }
    }
}
