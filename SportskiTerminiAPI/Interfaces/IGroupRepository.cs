using SportskiTerminiAPI.Models;

namespace SportskiTerminiAPI.Interfaces
{
    public interface IGroupRepository
    {
        Task<Group> CreateGroupAsync(Group group);
        Task<IEnumerable<Group>> GetAllGroupsAsync();
        Task<Group> UpdateGroupAsync(Group group);
        Task<Group?> GetGroupByIdAsync(int groupId);
        Task<IEnumerable<Group>> GetGroupsByAdminAsync(string adminId);
        Task AddMembershipAsync(GroupMembership membership);
        Task<GroupMembership?> GetMembershipByIdAsync(int membershipId);
        Task<IEnumerable<GroupMembership>> GetMembershipsForGroupAsync(int groupId);
        Task RemoveMembershipAsync(int membershipId);
        Task UpdateMembershipAsync(GroupMembership membership);
    }
}
