using Microsoft.AspNetCore.SignalR;
using SportskiTerminiAPI.DTOs;
using SportskiTerminiAPI.Hubs;
using SportskiTerminiAPI.Interfaces;
using SportskiTerminiAPI.Models;

namespace SportskiTerminiAPI.Services
{
    public class GroupNotificationService : IGroupNotificationService
    {
        private readonly INotificationRepository _notificationRepository;
        private readonly IHubContext<SystemNotificationHub> _systemNotificationHubContext;

        public GroupNotificationService(
            INotificationRepository notificationRepository,
            IHubContext<SystemNotificationHub> systemNotificationHubContext)
        {
            _notificationRepository = notificationRepository;
            _systemNotificationHubContext = systemNotificationHubContext;
        }

        public async Task CreateGroupJoinRequestNotificationAsync(string userId, string actorUserId, int groupId, int membershipId)
        {
            var notification = await _notificationRepository.AddNotificationAsync(new AppNotification
            {
                UserId = userId,
                ActorUserId = actorUserId,
                GroupId = groupId,
                MembershipId = membershipId,
                Type = AppNotificationType.GroupJoinRequestReceived,
                CreatedAt = DateTime.UtcNow
            });

            await BroadcastSystemNotificationAsync(notification);
        }

        public async Task CreateGroupInvitationNotificationAsync(string userId, string actorUserId, int groupId, int membershipId)
        {
            var notification = await _notificationRepository.AddNotificationAsync(new AppNotification
            {
                UserId = userId,
                ActorUserId = actorUserId,
                GroupId = groupId,
                MembershipId = membershipId,
                Type = AppNotificationType.GroupInvitationReceived,
                CreatedAt = DateTime.UtcNow
            });

            await BroadcastSystemNotificationAsync(notification);
        }

        public async Task CreateGroupInvitationAcceptedNotificationAsync(string userId, string actorUserId, int groupId, int membershipId)
        {
            var notification = await _notificationRepository.AddNotificationAsync(new AppNotification
            {
                UserId = userId,
                ActorUserId = actorUserId,
                GroupId = groupId,
                MembershipId = membershipId,
                Type = AppNotificationType.GroupInvitationAccepted,
                CreatedAt = DateTime.UtcNow
            });

            await BroadcastSystemNotificationAsync(notification);
        }

        public async Task CreateGroupJoinRequestAcceptedNotificationAsync(string userId, string actorUserId, int groupId, int membershipId)
        {
            var notification = await _notificationRepository.AddNotificationAsync(new AppNotification
            {
                UserId = userId,
                ActorUserId = actorUserId,
                GroupId = groupId,
                MembershipId = membershipId,
                Type = AppNotificationType.GroupJoinRequestAccepted,
                CreatedAt = DateTime.UtcNow
            });

            await BroadcastSystemNotificationAsync(notification);
        }

        public async Task DeleteGroupInvitationNotificationsAsync(int groupId, string userId, int membershipId)
        {
            var notifications = await _notificationRepository.GetNotificationsAsync(
                AppNotificationType.GroupInvitationReceived,
                userId: userId,
                groupId: groupId,
                membershipId: membershipId);

            await _notificationRepository.RemoveNotificationsAsync(notifications);
        }

        public async Task DeleteGroupJoinRequestNotificationsAsync(int groupId, string adminUserId, string actorUserId, int membershipId)
        {
            var notifications = await _notificationRepository.GetNotificationsAsync(
                AppNotificationType.GroupJoinRequestReceived,
                userId: adminUserId,
                actorUserId: actorUserId,
                groupId: groupId,
                membershipId: membershipId);

            await _notificationRepository.RemoveNotificationsAsync(notifications);
        }

        public async Task MarkInvitationNotificationsAsReadAsync(int membershipId, string userId)
        {
            var notifications = await _notificationRepository.GetNotificationsAsync(
                AppNotificationType.GroupInvitationReceived,
                userId: userId,
                membershipId: membershipId);

            foreach (var notification in notifications)
            {
                notification.IsRead = true;
                notification.ReadAt = DateTime.UtcNow;
            }

            if (notifications.Any())
            {
                await _notificationRepository.SaveChangesAsync();
            }
        }

        private async Task BroadcastSystemNotificationAsync(AppNotification notification)
        {
            await _systemNotificationHubContext.Clients
                .User(notification.UserId)
                .SendAsync("ReceiveSystemNotification", ToDto(notification));
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
    }
}
