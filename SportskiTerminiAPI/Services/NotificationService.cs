using SportskiTerminiAPI.DTOs;
using SportskiTerminiAPI.Interfaces;
using SportskiTerminiAPI.Models;

namespace SportskiTerminiAPI.Services
{
    public class NotificationService : INotificationService
    {
        private readonly INotificationRepository _notificationRepository;
        private readonly IGroupRepository _groupRepository;

        public NotificationService(INotificationRepository notificationRepository, IGroupRepository groupRepository)
        {
            _notificationRepository = notificationRepository;
            _groupRepository = groupRepository;
        }

        public async Task<IEnumerable<NotificationDto>> GetMyNotificationsAsync(string userId)
        {
            await EnsurePendingInvitationNotificationsAsync(userId);
            await DeleteCanceledMembershipNotificationsAsync(userId);

            var notifications = await _notificationRepository.GetNotificationsForUserAsync(userId, 30);
            return notifications.Select(ToDto);
        }

        public async Task<int> GetUnreadCountAsync(string userId)
        {
            await DeleteCanceledMembershipNotificationsAsync(userId);
            return await _notificationRepository.GetUnreadCountAsync(userId);
        }

        public async Task<ServiceResult> MarkAllAsReadAsync(string userId)
        {
            var notifications = await _notificationRepository.GetUnreadNotificationsAsync(userId);

            foreach (var notification in notifications)
            {
                notification.IsRead = true;
                notification.ReadAt = DateTime.UtcNow;
            }

            await _notificationRepository.SaveChangesAsync();
            return ServiceResult.Ok(new { message = "Notifications marked as read" });
        }

        public async Task<ServiceResult> MarkAsReadAsync(string userId, int notificationId)
        {
            var notification = await _notificationRepository.GetNotificationByIdForUserAsync(notificationId, userId);
            if (notification == null)
                return ServiceResult.NotFound("Notification not found");

            notification.IsRead = true;
            notification.ReadAt = DateTime.UtcNow;
            await _notificationRepository.SaveChangesAsync();

            return ServiceResult.Ok(new { message = "Notification marked as read" });
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
            var pendingInvitations = (await _groupRepository.GetMembershipsForUserAsync(userId))
                .Where(m => m.Status == MembershipStatus.PendingInvitation)
                .ToList();

            var notificationsToAdd = new List<AppNotification>();

            foreach (var invitation in pendingInvitations)
            {
                var notificationExists = await _notificationRepository.NotificationExistsAsync(
                    userId,
                    AppNotificationType.GroupInvitationReceived,
                    invitation.Id);

                if (!notificationExists)
                {
                    notificationsToAdd.Add(new AppNotification
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

            if (notificationsToAdd.Count > 0)
                await _notificationRepository.AddNotificationsAsync(notificationsToAdd);
        }

        private async Task DeleteCanceledMembershipNotificationsAsync(string userId)
        {
            var canceledNotifications = await _notificationRepository.GetPendingInvitationNotificationsAsync(userId);
            if (canceledNotifications.Count == 0)
                return;

            await _notificationRepository.RemoveNotificationsAsync(canceledNotifications);
        }
    }
}
