using SportsBookingAPI.Models;

namespace SportsBookingAPI.Interfaces
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
        Task<bool> ReservationReminderExistsAsync(int reservationId, AppNotificationType type);
        Task<AppNotification> AddNotificationAsync(AppNotification notification);
        Task AddNotificationsAsync(IEnumerable<AppNotification> notifications);
        Task RemoveNotificationsAsync(IEnumerable<AppNotification> notifications);
        Task SaveChangesAsync();
        Task<List<AppNotification>> GetAllNotificationsAsync(int take = 100, AppNotificationType? type = null, bool? isRead = null, string? username = null);
        Task<AppNotification?> GetNotificationByIdAsync(int id);
    }
}
