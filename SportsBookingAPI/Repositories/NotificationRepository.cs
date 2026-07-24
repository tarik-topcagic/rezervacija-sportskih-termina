using Microsoft.EntityFrameworkCore;
using SportsBookingAPI.Data;
using SportsBookingAPI.Interfaces;
using SportsBookingAPI.Models;

namespace SportsBookingAPI.Repositories
{
    public class NotificationRepository : INotificationRepository
    {
        private readonly ApplicationDBContext _context;

        public NotificationRepository(ApplicationDBContext context)
        {
            _context = context;
        }

        public async Task<List<AppNotification>> GetNotificationsForUserAsync(string userId, int take)
        {
            return await _context.Notifications
                .Where(n => n.UserId == userId)
                .Include(n => n.Group)
                .Include(n => n.ActorUser)
                .Include(n => n.Membership)
                .Include(n => n.Reservation)
                .ThenInclude(r => r!.Arena)
                .OrderByDescending(n => n.CreatedAt)
                .Take(take)
                .ToListAsync();
        }

        public async Task<int> GetUnreadCountAsync(string userId)
        {
            return await _context.Notifications.CountAsync(n => n.UserId == userId && !n.IsRead);
        }

        public async Task<List<AppNotification>> GetUnreadNotificationsAsync(string userId)
        {
            return await _context.Notifications
                .Where(n => n.UserId == userId && !n.IsRead)
                .ToListAsync();
        }

        public async Task<AppNotification?> GetNotificationByIdForUserAsync(int notificationId, string userId)
        {
            return await _context.Notifications
                .FirstOrDefaultAsync(n => n.Id == notificationId && n.UserId == userId);
        }

        public async Task<List<AppNotification>> GetPendingInvitationNotificationsAsync(string userId)
        {
            return await _context.Notifications
                .Where(n => n.UserId == userId
                    && n.MembershipId == null
                    && (n.Type == AppNotificationType.GroupInvitationReceived
                        || n.Type == AppNotificationType.GroupJoinRequestReceived))
                .ToListAsync();
        }

        public async Task<List<AppNotification>> GetNotificationsAsync(
            AppNotificationType type,
            string? userId = null,
            string? actorUserId = null,
            int? groupId = null,
            int? membershipId = null)
        {
            var query = _context.Notifications.Where(n => n.Type == type);

            if (!string.IsNullOrWhiteSpace(userId))
                query = query.Where(n => n.UserId == userId);

            if (!string.IsNullOrWhiteSpace(actorUserId))
                query = query.Where(n => n.ActorUserId == actorUserId);

            if (groupId.HasValue)
                query = query.Where(n => n.GroupId == groupId.Value);

            if (membershipId.HasValue)
                query = query.Where(n => n.MembershipId == membershipId.Value);

            return await query.ToListAsync();
        }

        public async Task<bool> NotificationExistsAsync(string userId, AppNotificationType type, int membershipId)
        {
            return await _context.Notifications.AnyAsync(n =>
                n.UserId == userId
                && n.Type == type
                && n.MembershipId == membershipId);
        }

        public async Task<bool> ReservationReminderExistsAsync(int reservationId, AppNotificationType type)
        {
            return await _context.Notifications.AnyAsync(n =>
                n.ReservationId == reservationId
                && n.Type == type);
        }

        public async Task<AppNotification> AddNotificationAsync(AppNotification notification)
        {
            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();

            return await _context.Notifications
                .Include(n => n.Group)
                .Include(n => n.ActorUser)
                .Include(n => n.Membership)
                .Include(n => n.Reservation)
                .ThenInclude(r => r!.Arena)
                .FirstAsync(n => n.Id == notification.Id);
        }

        public async Task AddNotificationsAsync(IEnumerable<AppNotification> notifications)
        {
            _context.Notifications.AddRange(notifications);
            await _context.SaveChangesAsync();
        }

        public async Task RemoveNotificationsAsync(IEnumerable<AppNotification> notifications)
        {
            _context.Notifications.RemoveRange(notifications);
            await _context.SaveChangesAsync();
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }

        public async Task<List<AppNotification>> GetAllNotificationsAsync(int take = 100, AppNotificationType? type = null, bool? isRead = null, string? username = null)
        {
            var query = _context.Notifications
                .Include(n => n.User)
                .Include(n => n.Group)
                .Include(n => n.ActorUser)
                .Include(n => n.Membership)
                .Include(n => n.Reservation)
                .ThenInclude(r => r!.Arena)
                .AsQueryable();

            if (type.HasValue)
                query = query.Where(n => n.Type == type.Value);

            if (isRead.HasValue)
                query = query.Where(n => n.IsRead == isRead.Value);

            if (!string.IsNullOrWhiteSpace(username))
            {
                var normalizedUsername = username.Trim().ToLower();
                query = query.Where(n => n.User != null && n.User.UserName != null && n.User.UserName.ToLower().Contains(normalizedUsername));
            }

            return await query
                .OrderByDescending(n => n.CreatedAt)
                .Take(take)
                .ToListAsync();
        }

        public async Task<AppNotification?> GetNotificationByIdAsync(int id)
        {
            return await _context.Notifications
                .Include(n => n.Group)
                .Include(n => n.ActorUser)
                .Include(n => n.Membership)
                .Include(n => n.Reservation)
                .ThenInclude(r => r!.Arena)
                .FirstOrDefaultAsync(n => n.Id == id);
        }
    }
}
