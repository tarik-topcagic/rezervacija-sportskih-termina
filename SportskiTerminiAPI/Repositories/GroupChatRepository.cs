using Microsoft.EntityFrameworkCore;
using SportskiTerminiAPI.Data;
using SportskiTerminiAPI.DTOs;
using SportskiTerminiAPI.Interfaces;
using SportskiTerminiAPI.Models;

namespace SportskiTerminiAPI.Repositories
{
    public class GroupChatRepository : IGroupChatRepository
    {
        private readonly ApplicationDBContext _context;

        public GroupChatRepository(ApplicationDBContext context)
        {
            _context = context;
        }

        public async Task<IReadOnlyList<GroupMessage>> GetMessagesForGroupAsync(int groupId)
        {
            return await _context.GroupMessages
                .Where(message => message.GroupId == groupId)
                .Include(message => message.SenderUser)
                .OrderBy(message => message.CreatedAt)
                .ToListAsync();
        }

        public async Task<GroupMessage> CreateMessageAsync(GroupMessage message)
        {
            _context.GroupMessages.Add(message);
            await _context.SaveChangesAsync();

            await _context.Entry(message)
                .Reference(savedMessage => savedMessage.SenderUser)
                .LoadAsync();

            return message;
        }

        public async Task<IReadOnlyList<GroupChatNotificationDto>> GetChatNotificationsAsync(string userId, int take)
        {
            var accessibleGroupIds = await _context.Groups
                .Where(group =>
                    group.AdminId == userId
                    || group.Memberships.Any(membership =>
                        membership.UserId == userId
                        && membership.Status == MembershipStatus.Accepted))
                .Select(group => group.Id)
                .ToListAsync();

            if (accessibleGroupIds.Count == 0)
                return Array.Empty<GroupChatNotificationDto>();

            var candidateMessages = await _context.GroupMessages
                .Where(message => accessibleGroupIds.Contains(message.GroupId) && message.SenderUserId != userId)
                .Include(message => message.Group)
                .Include(message => message.SenderUser)
                .ToListAsync();

            if (candidateMessages.Count == 0)
                return Array.Empty<GroupChatNotificationDto>();

            var latestMessages = candidateMessages
                .GroupBy(message => message.GroupId)
                .Select(group => group
                    .OrderByDescending(message => message.CreatedAt)
                    .First())
                .OrderByDescending(message => message.CreatedAt)
                .Take(take)
                .ToList();

            var groupIds = latestMessages.Select(message => message.GroupId).Distinct().ToList();

            var readStates = await _context.GroupChatReadStates
                .Where(readState => readState.UserId == userId && groupIds.Contains(readState.GroupId))
                .ToDictionaryAsync(readState => readState.GroupId, readState => readState.LastReadAt);

            var unreadCounts = candidateMessages
                .Where(message => groupIds.Contains(message.GroupId))
                .GroupBy(message => message.GroupId)
                .ToDictionary(
                    group => group.Key,
                    group => group.Count(message =>
                        !readStates.TryGetValue(group.Key, out var lastReadAt)
                        || message.CreatedAt > lastReadAt));

            return latestMessages.Select(message =>
            {
                var unreadCount = unreadCounts.GetValueOrDefault(message.GroupId);

                return new GroupChatNotificationDto
                {
                    GroupId = message.GroupId,
                    GroupName = message.Group?.Name ?? string.Empty,
                    GroupImageUrl = message.Group?.ImageUrl ?? "default-group.png",
                    SenderUserId = message.SenderUserId,
                    SenderName = !string.IsNullOrWhiteSpace(message.SenderUser?.FullName)
                        ? message.SenderUser.FullName
                        : message.SenderUser?.UserName ?? string.Empty,
                    SenderProfilePictureUrl = message.SenderUser?.ProfilePictureUrl ?? "default-profile.png",
                    LatestMessagePreview = message.MessageText,
                    CreatedAt = ToUtcOffset(message.CreatedAt),
                    UnreadCount = unreadCount,
                    IsRead = unreadCount == 0
                };
            }).ToList();
        }

        public async Task<int> GetUnreadChatMessagesCountAsync(string userId)
        {
            var accessibleGroupIds = await _context.Groups
                .Where(group =>
                    group.AdminId == userId
                    || group.Memberships.Any(membership =>
                        membership.UserId == userId
                        && membership.Status == MembershipStatus.Accepted))
                .Select(group => group.Id)
                .ToListAsync();

            if (accessibleGroupIds.Count == 0)
                return 0;

            var readStates = await _context.GroupChatReadStates
                .Where(readState => readState.UserId == userId)
                .ToDictionaryAsync(readState => readState.GroupId, readState => readState.LastReadAt);

            var unreadMessages = await _context.GroupMessages
                .Where(message =>
                    accessibleGroupIds.Contains(message.GroupId)
                    && message.SenderUserId != userId)
                .ToListAsync();

            return unreadMessages.Count(message =>
                !readStates.TryGetValue(message.GroupId, out var lastReadAt)
                || message.CreatedAt > lastReadAt);
        }

        public async Task MarkGroupAsReadAsync(string userId, int groupId, DateTime readAt)
        {
            var readState = await _context.GroupChatReadStates
                .FirstOrDefaultAsync(existingState =>
                    existingState.UserId == userId
                    && existingState.GroupId == groupId);

            if (readState == null)
            {
                _context.GroupChatReadStates.Add(new GroupChatReadState
                {
                    UserId = userId,
                    GroupId = groupId,
                    LastReadAt = readAt
                });
            }
            else
            {
                readState.LastReadAt = readAt;
            }

            await _context.SaveChangesAsync();
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
