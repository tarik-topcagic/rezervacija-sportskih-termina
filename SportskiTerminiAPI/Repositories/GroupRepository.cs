using Microsoft.EntityFrameworkCore;
using SportskiTerminiAPI.Data;
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

        public async Task DeleteGroupAsync(int groupId)
        {
            await using var transaction = await _context.Database.BeginTransactionAsync();

            var group = await _context.Groups.FirstOrDefaultAsync(g => g.Id == groupId);
            if (group == null)
            {
                return;
            }

            var memberships = await _context.GroupMemberships
                .Where(membership => membership.GroupId == groupId)
                .Select(membership => membership.Id)
                .ToListAsync();

            var groupMessageIds = await _context.GroupMessages
                .Where(message => message.GroupId == groupId)
                .Select(message => message.Id)
                .ToListAsync();

            var notifications = await _context.Notifications
                .Where(notification => notification.GroupId == groupId
                    || (notification.MembershipId.HasValue && memberships.Contains(notification.MembershipId.Value)))
                .ToListAsync();

            if (notifications.Count > 0)
            {
                _context.Notifications.RemoveRange(notifications);
            }

            var groupReadStates = await _context.GroupChatReadStates
                .Where(readState => readState.GroupId == groupId)
                .ToListAsync();

            if (groupReadStates.Count > 0)
            {
                _context.GroupChatReadStates.RemoveRange(groupReadStates);
            }

            if (groupMessageIds.Count > 0)
            {
                var messageReceipts = await _context.GroupMessageReceipts
                    .Where(receipt => groupMessageIds.Contains(receipt.GroupMessageId))
                    .ToListAsync();

                if (messageReceipts.Count > 0)
                {
                    _context.GroupMessageReceipts.RemoveRange(messageReceipts);
                }

                var groupMessages = await _context.GroupMessages
                    .Where(message => groupMessageIds.Contains(message.Id))
                    .ToListAsync();

                if (groupMessages.Count > 0)
                {
                    _context.GroupMessages.RemoveRange(groupMessages);
                }
            }

            if (memberships.Count > 0)
            {
                var groupMemberships = await _context.GroupMemberships
                    .Where(membership => memberships.Contains(membership.Id))
                    .ToListAsync();

                if (groupMemberships.Count > 0)
                {
                    _context.GroupMemberships.RemoveRange(groupMemberships);
                }
            }

            _context.Groups.Remove(group);

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();
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
                .Include(g => g.Admin)
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
            return await _context.GroupMemberships
                .Include(m => m.User)
                .Include(m => m.group)
                .ThenInclude(g => g.Admin)
                .FirstOrDefaultAsync(m => m.Id == membershipId);
        }

        public async Task<GroupMembership?> GetMembershipAsync(int groupId, string userId)
        {
            return await _context.GroupMemberships
                .Include(m => m.User)
                .FirstOrDefaultAsync(m => m.GroupId == groupId && m.UserId == userId);
        }

        public async Task<IEnumerable<GroupMembership>> GetMembershipsForGroupAsync(int groupId)
        {
            return await _context.GroupMemberships
                .Where(m => m.GroupId == groupId)
                .Include(m => m.User)
                .ToListAsync();
        }

        public async Task<IEnumerable<GroupMembership>> GetMembershipsForUserAsync(string userId)
        {
            return await _context.GroupMemberships
                .Where(m => m.UserId == userId)
                .Include(m => m.User)
                .Include(m => m.group)
                .ToListAsync();
        }

        public async Task<bool> ShareAcceptedGroupAsync(string firstUserId, string secondUserId)
        {
            return await _context.Groups.AnyAsync(group =>
                (group.AdminId == firstUserId || group.Memberships.Any(membership =>
                    membership.UserId == firstUserId
                    && membership.Status == MembershipStatus.Accepted))
                && (group.AdminId == secondUserId || group.Memberships.Any(membership =>
                    membership.UserId == secondUserId
                    && membership.Status == MembershipStatus.Accepted)));
        }

        public async Task<IReadOnlyList<string>> GetPresenceViewerUserIdsAsync(string userId)
        {
            var groups = await _context.Groups
                .Where(group => group.AdminId == userId
                    || group.Memberships.Any(membership =>
                        membership.UserId == userId
                        && membership.Status == MembershipStatus.Accepted))
                .Select(group => new
                {
                    group.AdminId,
                    AcceptedUserIds = group.Memberships
                        .Where(membership => membership.Status == MembershipStatus.Accepted)
                        .Select(membership => membership.UserId)
                })
                .ToListAsync();

            var viewerIds = new HashSet<string>();

            foreach (var group in groups)
            {
                if (!string.Equals(group.AdminId, userId, StringComparison.Ordinal))
                {
                    viewerIds.Add(group.AdminId);
                }

                foreach (var acceptedUserId in group.AcceptedUserIds)
                {
                    if (!string.Equals(acceptedUserId, userId, StringComparison.Ordinal))
                    {
                        viewerIds.Add(acceptedUserId);
                    }
                }
            }

            return viewerIds.ToList();
        }

        public async Task<IEnumerable<Group>> GetPublicGroupsAsync(string userId)
        {
            return await _context.Groups
                .Include(g => g.Memberships)
                .Where(g => g.AdminId != userId && !g.Memberships.Any(m => m.UserId == userId && m.Status != MembershipStatus.Declined))
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

        public async Task<IEnumerable<Group>> SearchGroupsAsync(string query)
        {
            return await _context.Groups
                .Include(g => g.Memberships)
                .ThenInclude(m => m.User)
                .Where(g => g.Name.Contains(query) || g.Description.Contains(query) || g.Grad.Contains(query) || g.KategorijaSporta.Contains(query))
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
