using SportsBookingAPI.DTOs;
using SportsBookingAPI.Services;

namespace SportsBookingAPI.Interfaces
{
    public interface IPrivateChatService
    {
        Task<ServiceResult> GetConversationsAsync(string userId);
        Task<ServiceResult> GetConversationMessagesAsync(string userId, int conversationId);
        Task<ServiceResult> GetOrCreateConversationAsync(string currentUserId, string targetUserId);
        Task<ServiceResult> CreateMessageForUserAsync(string senderUserId, string targetUserId, CreatePrivateMessageDto createPrivateMessageDto);
        Task<ServiceResult> CreateMessageForConversationAsync(string senderUserId, int conversationId, CreatePrivateMessageDto createPrivateMessageDto);
        Task AcknowledgeMessageDeliveredAsync(string userId, int conversationId, int messageId);
        Task AcknowledgeMessageSeenAsync(string userId, int conversationId, int messageId);
        Task<ServiceResult> DeletePrivateMessageAsync(string userId, int conversationId, int messageId);
        Task<ServiceResult> SetPrivateMessagePinnedAsync(string userId, int conversationId, int messageId, bool isPinned);
        Task<ServiceResult> AddOrUpdatePrivateMessageReactionAsync(string userId, int conversationId, int messageId, string emoji);
        Task<ServiceResult> RemovePrivateMessageReactionAsync(string userId, int conversationId, int messageId);
    }
}
