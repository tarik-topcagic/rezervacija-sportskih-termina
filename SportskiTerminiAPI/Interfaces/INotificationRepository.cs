using SportskiTerminiAPI.Models;

namespace SportskiTerminiAPI.Interfaces
{
    public interface INotificationRepository
    {
        Task<List<AppNotification>> GetNotificationsForUserAsync(string userId, int take);
        Task<int> GetUnreadCountAsync(string userId);
        Task<List<AppNotification>> GetUnreadNotificationsAsync(string userId);
        Task<AppNotification?> GetNotificationByIdForUserAsync(int notificationId, string userId);
        Task<List<AppNotification>> GetPendingInvitationNotificationsAsync(string userId);
        Task<List<AppNotification>> GetNotificationsAsync(
            AppNotificationType type,
            string? userId = null,
            string? actorUserId = null,
            int? groupId = null,
            int? membershipId = null);
        Task<bool> NotificationExistsAsync(string userId, AppNotificationType type, int membershipId);
        Task<AppNotification> AddNotificationAsync(AppNotification notification);
        Task AddNotificationsAsync(IEnumerable<AppNotification> notifications);
        Task RemoveNotificationsAsync(IEnumerable<AppNotification> notifications);
        Task SaveChangesAsync();
    }
}
