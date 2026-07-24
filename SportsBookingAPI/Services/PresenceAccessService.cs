using SportsBookingAPI.DTOs;
using SportsBookingAPI.Interfaces;
using SportsBookingAPI.Models;

namespace SportsBookingAPI.Services
{
    public class PresenceAccessService : IPresenceAccessService
    {
        private readonly IPrivateChatRepository _privateChatRepository;
        private readonly IGroupRepository _groupRepository;
        private readonly IPresenceService _presenceService;

        public PresenceAccessService(
            IPrivateChatRepository privateChatRepository,
            IGroupRepository groupRepository,
            IPresenceService presenceService)
        {
            _privateChatRepository = privateChatRepository;
            _groupRepository = groupRepository;
            _presenceService = presenceService;
        }

        public async Task<bool> CanViewUserPresenceAsync(string viewerUserId, string targetUserId)
        {
            if (string.IsNullOrWhiteSpace(viewerUserId)
                || string.IsNullOrWhiteSpace(targetUserId)
                || viewerUserId == targetUserId)
            {
                return false;
            }

            if (await _privateChatRepository.HasConversationAsync(viewerUserId, targetUserId))
            {
                return true;
            }

            return await _groupRepository.ShareAcceptedGroupAsync(viewerUserId, targetUserId);
        }

        public async Task<IReadOnlyList<string>> GetAllowedViewerUserIdsAsync(string targetUserId)
        {
            var allowedViewerIds = new HashSet<string>(
                await _privateChatRepository.GetConversationPartnerUserIdsAsync(targetUserId));

            foreach (var viewerUserId in await _groupRepository.GetPresenceViewerUserIdsAsync(targetUserId))
            {
                allowedViewerIds.Add(viewerUserId);
            }

            allowedViewerIds.Remove(targetUserId);
            return allowedViewerIds.ToList();
        }

        public async Task<ServiceResult> GetUserPresenceAsync(string viewerUserId, string targetUserId)
        {
            if (!await CanViewUserPresenceAsync(viewerUserId, targetUserId))
            {
                return ServiceResult.Forbid();
            }

            return ServiceResult.Ok(new UserPresenceDto
            {
                UserId = targetUserId,
                IsOnline = _presenceService.IsOnline(targetUserId)
            });
        }

        public async Task<ServiceResult> GetGroupPresenceAsync(string viewerUserId, int groupId)
        {
            var group = await _groupRepository.GetGroupByIdAsync(groupId);
            if (group == null)
            {
                return ServiceResult.NotFound("Group not found");
            }

            if (!CanAccessGroupPresence(group, viewerUserId))
            {
                return ServiceResult.Forbid("Only accepted group members and admin can access group presence");
            }

            var candidateUserIds = new HashSet<string>();

            if (!string.IsNullOrWhiteSpace(group.AdminId))
            {
                candidateUserIds.Add(group.AdminId);
            }

            foreach (var membership in group.Memberships)
            {
                if (membership.Status != MembershipStatus.Accepted)
                {
                    continue;
                }

                candidateUserIds.Add(membership.UserId);
            }

            var onlineUserIds = _presenceService.GetOnlineUserIds(candidateUserIds);

            return ServiceResult.Ok(new GroupPresenceDto
            {
                GroupId = groupId,
                HasOnlineMembers = onlineUserIds.Count > 0,
                OnlineUserIds = onlineUserIds.ToList()
            });
        }

        private static bool CanAccessGroupPresence(Group group, string userId)
        {
            return group.AdminId == userId
                || group.Memberships.Any(membership =>
                    membership.UserId == userId
                    && membership.Status == MembershipStatus.Accepted);
        }
    }
}
