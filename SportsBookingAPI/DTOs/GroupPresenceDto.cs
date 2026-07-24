namespace SportsBookingAPI.DTOs
{
    public class GroupPresenceDto
    {
        public int GroupId { get; set; }
        public bool HasOnlineMembers { get; set; }
        public List<string> OnlineUserIds { get; set; } = new();
    }
}
