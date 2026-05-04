using SportskiTerminiAPI.Models;
using SportskiTerminiAPI.DTOs;

namespace SportskiTerminiAPI.Interfaces
{
    public interface IPrivateChatRepository
    {
        Task<AppUser?> GetUserByIdAsync(string userId);
        Task<PrivateConversation?> GetConversationByIdAsync(int conversationId);
        Task<PrivateConversation?> GetConversationBetweenUsersAsync(string userOneId, string userTwoId);
        Task<PrivateConversation> CreateConversationAsync(PrivateConversation conversation);
        Task<bool> HasConversationAsync(string userOneId, string userTwoId);
        Task<IReadOnlyList<string>> GetConversationPartnerUserIdsAsync(string userId);
        Task<IReadOnlyList<PrivateConversation>> GetConversationsForUserAsync(string userId);
        Task<IReadOnlyList<PrivateMessage>> GetMessagesForConversationAsync(int conversationId);
        Task<PrivateMessage> CreateMessageAsync(PrivateMessage message);
        Task<IReadOnlyList<PrivateChatNotificationDto>> GetChatNotificationsAsync(string userId, int take);
        Task<int> GetUnreadChatMessagesCountAsync(string userId);
        Task MarkConversationAsReadAsync(string userId, int conversationId, DateTime readAt);
        Task<MessageStatusChange?> MarkMessageDeliveredAsync(int conversationId, int messageId, string userId, DateTime deliveredAt);
        Task<IReadOnlyList<MessageStatusChange>> MarkMessageSeenAsync(int conversationId, int messageId, string userId, DateTime seenAt);
        Task<IReadOnlyList<MessageStatusChange>> MarkMessagesSeenForConversationAsync(int conversationId, string userId, DateTime seenAt);
    }
}
