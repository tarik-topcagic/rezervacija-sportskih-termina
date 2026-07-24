using SportsBookingAPI.DTOs;
using SportsBookingAPI.Services;

namespace SportsBookingAPI.Interfaces
{
    public interface IGroupChatNotificationService
    {
        Task<IEnumerable<GroupChatNotificationDto>> GetChatNotificationsAsync(string userId);
        Task<int> GetUnreadCountAsync(string userId);
        Task<ServiceResult> MarkGroupAsReadAsync(string userId, int groupId);
    }
}
