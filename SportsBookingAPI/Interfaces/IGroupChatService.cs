using SportsBookingAPI.DTOs;
using SportsBookingAPI.Services;

namespace SportsBookingAPI.Interfaces
{
    public interface IGroupChatService
    {
        Task<ServiceResult> GetGroupMessagesAsync(string userId, int groupId);
        Task<ServiceResult> CreateGroupMessageAsync(string userId, int groupId, CreateGroupMessageDto createGroupMessageDto);
        Task AcknowledgeMessageDeliveredAsync(string userId, int groupId, int messageId);
        Task AcknowledgeMessageSeenAsync(string userId, int groupId, int messageId);
        Task<ServiceResult> DeleteGroupMessageAsync(string userId, int groupId, int messageId);
        Task<ServiceResult> SetGroupMessagePinnedAsync(string userId, int groupId, int messageId, bool isPinned);
        Task<ServiceResult> AddOrUpdateGroupMessageReactionAsync(string userId, int groupId, int messageId, string emoji);
        Task<ServiceResult> RemoveGroupMessageReactionAsync(string userId, int groupId, int messageId);
    }
}
