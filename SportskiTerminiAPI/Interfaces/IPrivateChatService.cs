using SportskiTerminiAPI.DTOs;
using SportskiTerminiAPI.Services;

namespace SportskiTerminiAPI.Interfaces
{
    public interface IPrivateChatService
    {
        Task<ServiceResult> GetConversationsAsync(string userId);
        Task<ServiceResult> GetConversationMessagesAsync(string userId, int conversationId);
        Task<ServiceResult> GetOrCreateConversationAsync(string currentUserId, string targetUserId);
        Task<ServiceResult> CreateMessageForUserAsync(string senderUserId, string targetUserId, CreatePrivateMessageDto createPrivateMessageDto);
        Task<ServiceResult> CreateMessageForConversationAsync(string senderUserId, int conversationId, CreatePrivateMessageDto createPrivateMessageDto);
    }
}
