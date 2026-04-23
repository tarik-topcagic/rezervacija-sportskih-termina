using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SportskiTerminiAPI.Data;
using SportskiTerminiAPI.DTOs;
using SportskiTerminiAPI.Models;
using System.Security.Claims;

namespace SportskiTerminiAPI.Controllers
{
    [Route("api/notifications")]
    [ApiController]
    [Authorize]
    public class NotificationController : ControllerBase
    {
        private readonly ApplicationDBContext _context;

        public NotificationController(ApplicationDBContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetMyNotifications()
        {
            var userId = User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized();

            await EnsurePendingInvitationNotificationsAsync(userId);
            await DeleteCanceledMembershipNotificationsAsync(userId);

            var notifications = await _context.Notifications
                .Where(n => n.UserId == userId)
                .Include(n => n.Group)
                .Include(n => n.ActorUser)
                .Include(n => n.Membership)
                .OrderByDescending(n => n.CreatedAt)
                .Take(30)
                .ToListAsync();

            return Ok(notifications.Select(ToDto));
        }

        [HttpGet("unread-count")]
        public async Task<IActionResult> GetUnreadCount()
        {
            var userId = User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized();

            await DeleteCanceledMembershipNotificationsAsync(userId);

            var count = await _context.Notifications.CountAsync(n => n.UserId == userId && !n.IsRead);
            return Ok(new { count });
        }

        [HttpPost("mark-all-read")]
        public async Task<IActionResult> MarkAllAsRead()
        {
            var userId = User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized();

            var notifications = await _context.Notifications
                .Where(n => n.UserId == userId && !n.IsRead)
                .ToListAsync();

            foreach (var notification in notifications)
            {
                notification.IsRead = true;
                notification.ReadAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Notifications marked as read" });
        }

        [HttpPost("{notificationId:int}/read")]
        public async Task<IActionResult> MarkAsRead(int notificationId)
        {
            var userId = User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized();

            var notification = await _context.Notifications
                .FirstOrDefaultAsync(n => n.Id == notificationId && n.UserId == userId);

            if (notification == null)
                return NotFound("Notification not found");

            notification.IsRead = true;
            notification.ReadAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Notification marked as read" });
        }

        private static NotificationDto ToDto(AppNotification notification)
        {
            return new NotificationDto
            {
                Id = notification.Id,
                Type = notification.Type,
                UserId = notification.UserId,
                ActorUserId = notification.ActorUserId,
                ActorName = !string.IsNullOrWhiteSpace(notification.ActorUser?.FullName)
                    ? notification.ActorUser.FullName
                    : notification.ActorUser?.UserName,
                GroupId = notification.GroupId,
                GroupName = notification.Group?.Name,
                MembershipId = notification.MembershipId,
                InvitationStatus = notification.Membership?.Status,
                MembershipStatus = notification.Membership?.Status,
                IsRead = notification.IsRead,
                CreatedAt = ToUtcOffset(notification.CreatedAt)
            };
        }

        private static DateTimeOffset ToUtcOffset(DateTime value)
        {
            var utcValue = value.Kind == DateTimeKind.Utc
                ? value
                : DateTime.SpecifyKind(value, DateTimeKind.Utc);

            return new DateTimeOffset(utcValue);
        }

        private async Task EnsurePendingInvitationNotificationsAsync(string userId)
        {
            var pendingInvitations = await _context.GroupMemberships
                .Include(m => m.group)
                .Where(m => m.UserId == userId && m.Status == MembershipStatus.PendingInvitation)
                .ToListAsync();

            foreach (var invitation in pendingInvitations)
            {
                var notificationExists = await _context.Notifications.AnyAsync(n =>
                    n.UserId == userId
                    && n.Type == AppNotificationType.GroupInvitationReceived
                    && n.MembershipId == invitation.Id);

                if (!notificationExists)
                {
                    _context.Notifications.Add(new AppNotification
                    {
                        UserId = userId,
                        ActorUserId = invitation.group.AdminId,
                        GroupId = invitation.GroupId,
                        MembershipId = invitation.Id,
                        Type = AppNotificationType.GroupInvitationReceived,
                        CreatedAt = invitation.CreatedAt
                    });
                }
            }

            await _context.SaveChangesAsync();
        }

        private async Task DeleteCanceledMembershipNotificationsAsync(string userId)
        {
            var canceledNotifications = await _context.Notifications
                .Where(n => n.UserId == userId
                    && n.MembershipId == null
                    && (n.Type == AppNotificationType.GroupInvitationReceived
                        || n.Type == AppNotificationType.GroupJoinRequestReceived))
                .ToListAsync();

            if (canceledNotifications.Count == 0)
                return;

            _context.Notifications.RemoveRange(canceledNotifications);
            await _context.SaveChangesAsync();
        }
    }
}
