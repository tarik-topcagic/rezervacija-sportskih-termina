using SportskiTerminiAPI.DTOs;
using SportskiTerminiAPI.Services;

namespace SportskiTerminiAPI.Interfaces
{
    public interface IGroupService
    {
        Task<ServiceResult> CreateGroupAsync(string userId, CreateGroupDto groupDto);
        Task<ServiceResult> UpdateGroupAsync(string userId, int groupId, UpdateGroupDto updateGroupDto);
        Task<GroupDetailsDto?> GetGroupDetailsAsync(string userId, int groupId);
        Task<IEnumerable<GroupDto>> GetAdminGroupsAsync(string userId);
        Task<IEnumerable<GroupDto>> GetMemberGroupsAsync(string userId);
        Task<IEnumerable<GroupDto>> SearchGroupsAsync(string userId, string? query);
    }
}
