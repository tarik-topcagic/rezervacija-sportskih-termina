namespace SportsBookingAPI.DTOs
{
    public class UserPresenceDto
    {
        public string UserId { get; set; } = string.Empty;
        public bool IsOnline { get; set; }
    }
}
