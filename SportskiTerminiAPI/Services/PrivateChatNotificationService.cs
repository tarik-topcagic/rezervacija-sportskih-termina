using SportskiTerminiAPI.DTOs;
using SportskiTerminiAPI.Interfaces;

namespace SportskiTerminiAPI.Services
{
    public class PrivateChatNotificationService : IPrivateChatNotificationService
    {
        private readonly IPrivateChatRepository _privateChatRepository;

        public PrivateChatNotificationService(IPrivateChatRepository privateChatRepository)
        {
            _privateChatRepository = privateChatRepository;
        }

        public async Task<IEnumerable<PrivateChatNotificationDto>> GetChatNotificationsAsync(string userId)
        {
            return await _privateChatRepository.GetChatNotificationsAsync(userId, 20);
        }

        public async Task<int> GetUnreadCountAsync(string userId)
        {
            return await _privateChatRepository.GetUnreadChatMessagesCountAsync(userId);
        }

        public async Task<ServiceResult> MarkConversationAsReadAsync(string userId, int conversationId)
        {
            var conversation = await _privateChatRepository.GetConversationByIdAsync(conversationId);
            if (conversation == null)
                return ServiceResult.NotFound("Conversation not found");

            if (conversation.UserOneId != userId && conversation.UserTwoId != userId)
                return ServiceResult.Forbid("Only conversation participants can access private chat");

            await _privateChatRepository.MarkConversationAsReadAsync(userId, conversationId, DateTime.UtcNow);
            return ServiceResult.Ok(new { message = "Private chat marked as read" });
        }
    }
}
