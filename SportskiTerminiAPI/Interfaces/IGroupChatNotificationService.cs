using SportskiTerminiAPI.DTOs;
using SportskiTerminiAPI.Services;

namespace SportskiTerminiAPI.Interfaces
{
    public interface IGroupChatNotificationService
    {
        Task<IEnumerable<GroupChatNotificationDto>> GetChatNotificationsAsync(string userId);
        Task<int> GetUnreadCountAsync(string userId);
        Task<ServiceResult> MarkGroupAsReadAsync(string userId, int groupId);
    }
}
