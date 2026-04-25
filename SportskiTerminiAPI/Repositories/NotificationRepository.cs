using Microsoft.EntityFrameworkCore;
using SportskiTerminiAPI.Data;
using SportskiTerminiAPI.Interfaces;
using SportskiTerminiAPI.Models;

namespace SportskiTerminiAPI.Repositories
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

        public async Task AddNotificationAsync(AppNotification notification)
        {
            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();
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
    }
}
