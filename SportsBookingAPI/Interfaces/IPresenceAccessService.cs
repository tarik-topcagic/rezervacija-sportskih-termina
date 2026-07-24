using SportsBookingAPI.Services;

namespace SportsBookingAPI.Interfaces
{
    public interface IPresenceAccessService
    {
        Task<bool> CanViewUserPresenceAsync(string viewerUserId, string targetUserId);
        Task<IReadOnlyList<string>> GetAllowedViewerUserIdsAsync(string targetUserId);
        Task<ServiceResult> GetUserPresenceAsync(string viewerUserId, string targetUserId);
        Task<ServiceResult> GetGroupPresenceAsync(string viewerUserId, int groupId);
    }
}
