using SportskiTerminiAPI.DTOs;
using SportskiTerminiAPI.Services;

namespace SportskiTerminiAPI.Interfaces
{
    public interface INotificationService
    {
        Task<IEnumerable<NotificationDto>> GetMyNotificationsAsync(string userId);
        Task<int> GetUnreadCountAsync(string userId);
        Task<ServiceResult> MarkAllAsReadAsync(string userId);
        Task<ServiceResult> MarkAsReadAsync(string userId, int notificationId);
    }
}
