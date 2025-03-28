using Microsoft.EntityFrameworkCore;
using SportskiTerminiAPI.Data;
using SportskiTerminiAPI.DTOs;
using SportskiTerminiAPI.Interfaces;
using SportskiTerminiAPI.Models;

namespace SportskiTerminiAPI.Repositories
{
    public class GroupRepository : IGroupRepository
    {
        private readonly ApplicationDBContext _context;
        public GroupRepository(ApplicationDBContext context)
        {
            _context = context;
        }
        public async Task AddMembershipAsync(GroupMembership membership)
        {
            _context.GroupMemberships.Add(membership);
            await _context.SaveChangesAsync();
        }

        public async Task<Group> CreateGroupAsync(Group group)
        {
            _context.Groups.Add(group);
            await _context.SaveChangesAsync();
            return group;
        }

        public async Task<IEnumerable<Group>> GetAllGroupsAsync()
        {
            return await _context.Groups
                .Include(g => g.Memberships)
                .ThenInclude(m => m.User)
                .ToListAsync();
        }

        public async Task<Group?> GetGroupByIdAsync(int groupId)
        {
            return await _context.Groups
                .Include(g => g.Memberships)
                .ThenInclude(m => m.User)
                .FirstOrDefaultAsync(g => g.Id == groupId);
        }

        public async Task<IEnumerable<Group>> GetGroupsByAdminAsync(string adminId)
        {
            return await _context.Groups
                .Include(g => g.Memberships)
                .Where(g => g.AdminId == adminId).ToListAsync();
        }

        public async Task<IEnumerable<Group>> GetMemberGroupsAsync(string userId)
        {
            return await _context.Groups
                .Include(g => g.Memberships)
                .Where(g => g.Memberships.Any(m => m.UserId == userId && m.Status == MembershipStatus.Accepted) && g.AdminId != userId)
                .ToListAsync();
        }

        public async Task<GroupMembership?> GetMembershipByIdAsync(int membershipId)
        {
            return await _context.GroupMemberships.FirstOrDefaultAsync(m => m.Id == membershipId);
        }

        public async Task<IEnumerable<GroupMembership>> GetMembershipsForGroupAsync(int groupId)
        {
            return await _context.GroupMemberships
                .Where(m => m.GroupId == groupId)
                .Include(m => m.User)
                .ToListAsync();
        }

        public async Task<IEnumerable<GroupDto>> GetPublicGroupsAsync(string userId)
        {
            return await _context.Groups
                .Include(g => g.Memberships)
                .Where(g => g.AdminId != userId && !g.Memberships.Any(m => m.UserId == userId))
                .Select(g => new GroupDto
                {
                    Id = g.Id,
                    Name = g.Name,
                    Description = g.Description,
                    AdminId = g.AdminId,
                    ImageUrl = g.ImageUrl,
                    MembersCount = g.Memberships.Count()
                })
                .ToListAsync();
        }

        public async Task RemoveMembershipAsync(int membershipId)
        {
            var membership = await _context.GroupMemberships.FindAsync(membershipId);
            if (membership != null)
            {
                _context.GroupMemberships.Remove(membership);
                await _context.SaveChangesAsync();  
            }
        }

        public async Task<IEnumerable<GroupDto>> SearchGroupsAsync(string query, string userId)
        {
            return await _context.Groups
                .Include(g => g.Memberships)
                .Where(g => (g.Name.Contains(query) || g.Description.Contains(query)))
                .Select(g => new GroupDto
                {
                    Id = g.Id,
                    Name = g.Name,
                    Description = g.Description,
                    AdminId = g.AdminId,
                    ImageUrl = g.ImageUrl,
                    MembersCount = g.Memberships.Count()
                })
                .ToListAsync();
        }

        public async Task<Group> UpdateGroupAsync(Group group)
        {
            _context.Groups.Update(group);
            await _context.SaveChangesAsync();  
            return group;
        }

        public async Task UpdateMembershipAsync(GroupMembership membership)
        {
            _context.GroupMemberships.Update(membership);
            await _context.SaveChangesAsync();
        }
    }
}
