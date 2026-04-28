using SportskiTerminiAPI.DTOs;
using SportskiTerminiAPI.Interfaces;
using SportskiTerminiAPI.Models;

namespace SportskiTerminiAPI.Services
{
    public class GroupChatNotificationService : IGroupChatNotificationService
    {
        private readonly IGroupRepository _groupRepository;
        private readonly IGroupChatRepository _groupChatRepository;

        public GroupChatNotificationService(IGroupRepository groupRepository, IGroupChatRepository groupChatRepository)
        {
            _groupRepository = groupRepository;
            _groupChatRepository = groupChatRepository;
        }

        public async Task<IEnumerable<GroupChatNotificationDto>> GetChatNotificationsAsync(string userId)
        {
            return await _groupChatRepository.GetChatNotificationsAsync(userId, 20);
        }

        public async Task<int> GetUnreadCountAsync(string userId)
        {
            return await _groupChatRepository.GetUnreadChatMessagesCountAsync(userId);
        }

        public async Task<ServiceResult> MarkGroupAsReadAsync(string userId, int groupId)
        {
            var group = await _groupRepository.GetGroupByIdAsync(groupId);
            if (group == null)
                return ServiceResult.NotFound("Group not found");

            if (!CanAccessGroupChat(group, userId))
                return ServiceResult.Forbid("Only accepted group members and admin can access group chat");

            await _groupChatRepository.MarkGroupAsReadAsync(userId, groupId, DateTime.UtcNow);
            return ServiceResult.Ok(new { message = "Group chat marked as read" });
        }

        private static bool CanAccessGroupChat(Group group, string userId)
        {
            return group.AdminId == userId
                || group.Memberships.Any(membership =>
                    membership.UserId == userId
                    && membership.Status == MembershipStatus.Accepted);
        }
    }
}
