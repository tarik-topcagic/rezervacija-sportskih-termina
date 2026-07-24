using SportsBookingAPI.DTOs;
using SportsBookingAPI.Services;

namespace SportsBookingAPI.Interfaces
{
    public interface IPrivateChatNotificationService
    {
        Task<IEnumerable<PrivateChatNotificationDto>> GetChatNotificationsAsync(string userId);
        Task<int> GetUnreadCountAsync(string userId);
        Task<ServiceResult> MarkConversationAsReadAsync(string userId, int conversationId);
    }
}
