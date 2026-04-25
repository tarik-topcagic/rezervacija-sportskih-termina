using SportskiTerminiAPI.Interfaces;
using SportskiTerminiAPI.Models;

namespace SportskiTerminiAPI.Services
{
    public class GroupNotificationService : IGroupNotificationService
    {
        private readonly INotificationRepository _notificationRepository;

        public GroupNotificationService(INotificationRepository notificationRepository)
        {
            _notificationRepository = notificationRepository;
        }

        public async Task CreateGroupJoinRequestNotificationAsync(string userId, string actorUserId, int groupId, int membershipId)
        {
            await _notificationRepository.AddNotificationAsync(new AppNotification
            {
                UserId = userId,
                ActorUserId = actorUserId,
                GroupId = groupId,
                MembershipId = membershipId,
                Type = AppNotificationType.GroupJoinRequestReceived,
                CreatedAt = DateTime.UtcNow
            });
        }

        public async Task CreateGroupInvitationNotificationAsync(string userId, string actorUserId, int groupId, int membershipId)
        {
            await _notificationRepository.AddNotificationAsync(new AppNotification
            {
                UserId = userId,
                ActorUserId = actorUserId,
                GroupId = groupId,
                MembershipId = membershipId,
                Type = AppNotificationType.GroupInvitationReceived,
                CreatedAt = DateTime.UtcNow
            });
        }

        public async Task CreateGroupInvitationAcceptedNotificationAsync(string userId, string actorUserId, int groupId, int membershipId)
        {
            await _notificationRepository.AddNotificationAsync(new AppNotification
            {
                UserId = userId,
                ActorUserId = actorUserId,
                GroupId = groupId,
                MembershipId = membershipId,
                Type = AppNotificationType.GroupInvitationAccepted,
                CreatedAt = DateTime.UtcNow
            });
        }

        public async Task CreateGroupJoinRequestAcceptedNotificationAsync(string userId, string actorUserId, int groupId, int membershipId)
        {
            await _notificationRepository.AddNotificationAsync(new AppNotification
            {
                UserId = userId,
                ActorUserId = actorUserId,
                GroupId = groupId,
                MembershipId = membershipId,
                Type = AppNotificationType.GroupJoinRequestAccepted,
                CreatedAt = DateTime.UtcNow
            });
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
    }
}
