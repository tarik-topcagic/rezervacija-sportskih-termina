using Microsoft.EntityFrameworkCore;
using SportskiTerminiAPI.Data;
using SportskiTerminiAPI.DTOs;
using SportskiTerminiAPI.Interfaces;
using SportskiTerminiAPI.Models;

namespace SportskiTerminiAPI.Repositories
{
    public class PrivateChatRepository : IPrivateChatRepository
    {
        private readonly ApplicationDBContext _context;

        public PrivateChatRepository(ApplicationDBContext context)
        {
            _context = context;
        }

        public async Task<AppUser?> GetUserByIdAsync(string userId)
        {
            return await _context.Users.FirstOrDefaultAsync(user => user.Id == userId);
        }

        public async Task<PrivateConversation?> GetConversationByIdAsync(int conversationId)
        {
            return await _context.PrivateConversations
                .Include(conversation => conversation.UserOne)
                .Include(conversation => conversation.UserTwo)
                .Include(conversation => conversation.PrivateMessages)
                .FirstOrDefaultAsync(conversation => conversation.Id == conversationId);
        }

        public async Task<PrivateConversation?> GetConversationBetweenUsersAsync(string userOneId, string userTwoId)
        {
            return await _context.PrivateConversations
                .Include(conversation => conversation.UserOne)
                .Include(conversation => conversation.UserTwo)
                .Include(conversation => conversation.PrivateMessages)
                .FirstOrDefaultAsync(conversation =>
                    conversation.UserOneId == userOneId
                    && conversation.UserTwoId == userTwoId);
        }

        public async Task<PrivateConversation> CreateConversationAsync(PrivateConversation conversation)
        {
            _context.PrivateConversations.Add(conversation);
            await _context.SaveChangesAsync();

            await _context.Entry(conversation)
                .Reference(savedConversation => savedConversation.UserOne)
                .LoadAsync();

            await _context.Entry(conversation)
                .Reference(savedConversation => savedConversation.UserTwo)
                .LoadAsync();

            return conversation;
        }

        public async Task<IReadOnlyList<PrivateConversation>> GetConversationsForUserAsync(string userId)
        {
            var conversations = await _context.PrivateConversations
                .Where(conversation => conversation.UserOneId == userId || conversation.UserTwoId == userId)
                .Include(conversation => conversation.UserOne)
                .Include(conversation => conversation.UserTwo)
                .Include(conversation => conversation.PrivateMessages)
                    .ThenInclude(message => message.SenderUser)
                .ToListAsync();

            return conversations
                .OrderByDescending(conversation => conversation.PrivateMessages
                    .OrderByDescending(message => message.CreatedAt)
                    .Select(message => (DateTime?)message.CreatedAt)
                    .FirstOrDefault() ?? conversation.CreatedAt)
                .ToList();
        }

        public async Task<IReadOnlyList<PrivateMessage>> GetMessagesForConversationAsync(int conversationId)
        {
            return await _context.PrivateMessages
                .Where(message => message.ConversationId == conversationId)
                .Include(message => message.SenderUser)
                .OrderBy(message => message.CreatedAt)
                .ToListAsync();
        }

        public async Task<PrivateMessage> CreateMessageAsync(PrivateMessage message)
        {
            _context.PrivateMessages.Add(message);
            await _context.SaveChangesAsync();

            await _context.Entry(message)
                .Reference(savedMessage => savedMessage.SenderUser)
                .LoadAsync();

            return message;
        }

        public async Task<IReadOnlyList<PrivateChatNotificationDto>> GetChatNotificationsAsync(string userId, int take)
        {
            var conversations = await _context.PrivateConversations
                .Where(conversation => conversation.UserOneId == userId || conversation.UserTwoId == userId)
                .Include(conversation => conversation.UserOne)
                .Include(conversation => conversation.UserTwo)
                .Include(conversation => conversation.PrivateMessages)
                    .ThenInclude(message => message.SenderUser)
                .ToListAsync();

            if (conversations.Count == 0)
                return Array.Empty<PrivateChatNotificationDto>();

            var conversationIds = conversations.Select(conversation => conversation.Id).ToList();

            var readStates = await _context.PrivateChatReadStates
                .Where(readState => readState.UserId == userId && conversationIds.Contains(readState.ConversationId))
                .ToDictionaryAsync(readState => readState.ConversationId, readState => readState.LastReadAt);

            var latestMessages = conversations
                .Select(conversation => new
                {
                    Conversation = conversation,
                    LatestMessage = conversation.PrivateMessages
                        .OrderByDescending(message => message.CreatedAt)
                        .FirstOrDefault()
                })
                .Where(item => item.LatestMessage != null)
                .OrderByDescending(item => item.LatestMessage!.CreatedAt)
                .Take(take)
                .ToList();

            return latestMessages.Select(item =>
            {
                var conversation = item.Conversation;
                var latestMessage = item.LatestMessage!;
                var otherUser = conversation.UserOneId == userId ? conversation.UserTwo : conversation.UserOne;
                var unreadCount = conversation.PrivateMessages.Count(message =>
                    message.SenderUserId != userId
                    && (!readStates.TryGetValue(conversation.Id, out var lastReadAt) || message.CreatedAt > lastReadAt));

                return new PrivateChatNotificationDto
                {
                    ConversationId = conversation.Id,
                    OtherUserId = otherUser?.Id ?? string.Empty,
                    OtherUsername = otherUser?.UserName ?? string.Empty,
                    OtherFullName = !string.IsNullOrWhiteSpace(otherUser?.FullName)
                        ? otherUser.FullName
                        : otherUser?.UserName ?? string.Empty,
                    OtherProfilePictureUrl = otherUser?.ProfilePictureUrl ?? "default-profile.png",
                    LatestMessagePreview = latestMessage.MessageText,
                    CreatedAt = ToUtcOffset(latestMessage.CreatedAt),
                    UnreadCount = unreadCount,
                    IsRead = unreadCount == 0
                };
            }).ToList();
        }

        public async Task<int> GetUnreadChatMessagesCountAsync(string userId)
        {
            var conversations = await _context.PrivateConversations
                .Where(conversation => conversation.UserOneId == userId || conversation.UserTwoId == userId)
                .Include(conversation => conversation.PrivateMessages)
                .ToListAsync();

            if (conversations.Count == 0)
                return 0;

            var conversationIds = conversations.Select(conversation => conversation.Id).ToList();
            var readStates = await _context.PrivateChatReadStates
                .Where(readState => readState.UserId == userId && conversationIds.Contains(readState.ConversationId))
                .ToDictionaryAsync(readState => readState.ConversationId, readState => readState.LastReadAt);

            return conversations.Sum(conversation => conversation.PrivateMessages.Count(message =>
                message.SenderUserId != userId
                && (!readStates.TryGetValue(conversation.Id, out var lastReadAt) || message.CreatedAt > lastReadAt)));
        }

        public async Task MarkConversationAsReadAsync(string userId, int conversationId, DateTime readAt)
        {
            var readState = await _context.PrivateChatReadStates
                .FirstOrDefaultAsync(existingState =>
                    existingState.UserId == userId
                    && existingState.ConversationId == conversationId);

            if (readState == null)
            {
                _context.PrivateChatReadStates.Add(new PrivateChatReadState
                {
                    UserId = userId,
                    ConversationId = conversationId,
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
