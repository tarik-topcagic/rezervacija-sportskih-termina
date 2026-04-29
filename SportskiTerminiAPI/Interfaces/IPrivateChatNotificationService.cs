using SportskiTerminiAPI.DTOs;
using SportskiTerminiAPI.Services;

namespace SportskiTerminiAPI.Interfaces
{
    public interface IPrivateChatNotificationService
    {
        Task<IEnumerable<PrivateChatNotificationDto>> GetChatNotificationsAsync(string userId);
        Task<int> GetUnreadCountAsync(string userId);
        Task<ServiceResult> MarkConversationAsReadAsync(string userId, int conversationId);
    }
}
