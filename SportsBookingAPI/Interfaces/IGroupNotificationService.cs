namespace SportsBookingAPI.Interfaces
{
    public interface IGroupNotificationService
    {
        Task CreateGroupJoinRequestNotificationAsync(string userId, string actorUserId, int groupId, int membershipId);
        Task CreateGroupInvitationNotificationAsync(string userId, string actorUserId, int groupId, int membershipId);
        Task CreateGroupInvitationAcceptedNotificationAsync(string userId, string actorUserId, int groupId, int membershipId);
        Task CreateGroupJoinRequestAcceptedNotificationAsync(string userId, string actorUserId, int groupId, int membershipId);
        Task DeleteGroupInvitationNotificationsAsync(int groupId, string userId, int membershipId);
        Task DeleteGroupJoinRequestNotificationsAsync(int groupId, string adminUserId, string actorUserId, int membershipId);
        Task MarkInvitationNotificationsAsReadAsync(int membershipId, string userId);
    }
}
