namespace SportsBookingAPI.Interfaces
{
    public interface IPresenceService
    {
        bool AddConnection(string userId, string connectionId);
        bool RemoveConnection(string userId, string connectionId);
        bool IsOnline(string userId);
        IReadOnlyList<string> GetOnlineUserIds(IEnumerable<string> userIds);
    }
}
