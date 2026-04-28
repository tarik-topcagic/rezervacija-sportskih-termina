using SportskiTerminiAPI.DTOs;
using SportskiTerminiAPI.Models;

namespace SportskiTerminiAPI.Interfaces
{
    public interface IGroupChatRepository
    {
        Task<IReadOnlyList<GroupMessage>> GetMessagesForGroupAsync(int groupId);
        Task<GroupMessage> CreateMessageAsync(GroupMessage message);
        Task<IReadOnlyList<GroupChatNotificationDto>> GetChatNotificationsAsync(string userId, int take);
        Task<int> GetUnreadChatMessagesCountAsync(string userId);
        Task MarkGroupAsReadAsync(string userId, int groupId, DateTime readAt);
    }
}
