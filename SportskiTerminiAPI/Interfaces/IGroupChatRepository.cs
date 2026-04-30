using SportskiTerminiAPI.DTOs;
using SportskiTerminiAPI.Models;

namespace SportskiTerminiAPI.Interfaces
{
    public interface IGroupChatRepository
    {
        Task<IReadOnlyList<GroupMessage>> GetMessagesForGroupAsync(int groupId);
        Task<GroupMessage?> GetMessageByIdAsync(int groupId, int messageId);
        Task<GroupMessage> CreateMessageAsync(GroupMessage message);
        Task CreateMessageReceiptsAsync(IEnumerable<GroupMessageReceipt> receipts);
        Task<IReadOnlyList<GroupChatNotificationDto>> GetChatNotificationsAsync(string userId, int take);
        Task<int> GetUnreadChatMessagesCountAsync(string userId);
        Task MarkGroupAsReadAsync(string userId, int groupId, DateTime readAt);
        Task<bool> IsGroupChatParticipantAsync(int groupId, string userId);
        Task<MessageStatusChange?> MarkMessageDeliveredAsync(int groupId, int messageId, string userId, DateTime deliveredAt);
        Task<IReadOnlyList<MessageStatusChange>> MarkMessageSeenAsync(int groupId, int messageId, string userId, DateTime seenAt);
        Task<IReadOnlyList<MessageStatusChange>> MarkMessagesSeenForGroupAsync(int groupId, string userId, DateTime seenAt);
    }
}
