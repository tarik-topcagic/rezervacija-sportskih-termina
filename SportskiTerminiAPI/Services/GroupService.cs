using SportskiTerminiAPI.DTOs;
using SportskiTerminiAPI.Helpers;
using SportskiTerminiAPI.Interfaces;
using SportskiTerminiAPI.Models;

namespace SportskiTerminiAPI.Services
{
    public class GroupService : IGroupService
    {
        private readonly IGroupRepository _groupRepository;

        public GroupService(IGroupRepository groupRepository)
        {
            _groupRepository = groupRepository;
        }

        public async Task<ServiceResult> CreateGroupAsync(string userId, CreateGroupDto groupDto)
        {
            var group = new Group
            {
                Name = groupDto.Name,
                Description = groupDto.Description,
                Grad = groupDto.Grad,
                KategorijaSporta = groupDto.KategorijaSporta,
                AdminId = userId,
                DateCreated = DateTime.UtcNow,
                ImageUrl = groupDto.ImageUrl ?? "default-group.png"
            };

            var createdGroup = await _groupRepository.CreateGroupAsync(group);

            var membership = new GroupMembership
            {
                GroupId = createdGroup.Id,
                UserId = userId,
                Status = MembershipStatus.Accepted,
                CreatedAt = DateTime.UtcNow,
                JoinedAt = DateTime.UtcNow,
                RespondedAt = DateTime.UtcNow
            };

            await _groupRepository.AddMembershipAsync(membership);

            return ServiceResult.Ok(GroupMappingHelper.ToGroupDto(createdGroup));
        }

        public async Task<ServiceResult> UpdateGroupAsync(string userId, int groupId, UpdateGroupDto updateGroupDto)
        {
            var group = await _groupRepository.GetGroupByIdAsync(groupId);
            if (group == null)
                return ServiceResult.NotFound("Group not found");

            if (group.AdminId != userId)
                return ServiceResult.Forbid("Only admin can update the group");

            group.Name = updateGroupDto.Name;
            group.Description = updateGroupDto.Description;
            group.Grad = updateGroupDto.Grad;
            group.KategorijaSporta = updateGroupDto.KategorijaSporta;
            group.ImageUrl = updateGroupDto.GroupPictureUrl ?? "default-group.png";

            var updatedGroup = await _groupRepository.UpdateGroupAsync(group);
            return ServiceResult.Ok(GroupMappingHelper.ToGroupDto(updatedGroup));
        }

        public async Task<GroupDetailsDto?> GetGroupDetailsAsync(string userId, int groupId)
        {
            var group = await _groupRepository.GetGroupByIdAsync(groupId);
            return group == null ? null : GroupMappingHelper.ToGroupDetailsDto(group, userId);
        }

        public async Task<IEnumerable<GroupDto>> GetAdminGroupsAsync(string userId)
        {
            var groups = await _groupRepository.GetGroupsByAdminAsync(userId);
            return groups.Select(GroupMappingHelper.ToGroupDto);
        }

        public async Task<IEnumerable<GroupDto>> GetMemberGroupsAsync(string userId)
        {
            var groups = await _groupRepository.GetMemberGroupsAsync(userId);
            return groups.Select(GroupMappingHelper.ToGroupDto);
        }

        public async Task<IEnumerable<GroupDto>> SearchGroupsAsync(string userId, string? query)
        {
            var groups = string.IsNullOrWhiteSpace(query)
                ? await _groupRepository.GetPublicGroupsAsync(userId)
                : await _groupRepository.SearchGroupsAsync(query);

            return groups.Select(GroupMappingHelper.ToGroupDto);
        }
    }
}
