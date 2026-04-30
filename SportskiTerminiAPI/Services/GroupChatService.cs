using Microsoft.AspNetCore.SignalR;
using SportskiTerminiAPI.Hubs;
using SportskiTerminiAPI.DTOs;
using SportskiTerminiAPI.Helpers;
using SportskiTerminiAPI.Interfaces;
using SportskiTerminiAPI.Models;

namespace SportskiTerminiAPI.Services
{
    public class GroupChatService : IGroupChatService
    {
        private readonly IGroupRepository _groupRepository;
        private readonly IGroupChatRepository _groupChatRepository;
        private readonly IHubContext<ChatHub> _hubContext;

        public GroupChatService(
            IGroupRepository groupRepository,
            IGroupChatRepository groupChatRepository,
            IHubContext<ChatHub> hubContext)
        {
            _groupRepository = groupRepository;
            _groupChatRepository = groupChatRepository;
            _hubContext = hubContext;
        }

        public async Task<ServiceResult> GetGroupMessagesAsync(string userId, int groupId)
        {
            var group = await _groupRepository.GetGroupByIdAsync(groupId);
            if (group == null)
                return ServiceResult.NotFound("Group not found");

            if (!CanAccessGroupChat(group, userId))
                return ServiceResult.Forbid("Only accepted group members and admin can access group chat");

            var seenChanges = await _groupChatRepository.MarkMessagesSeenForGroupAsync(groupId, userId, DateTime.UtcNow);
            var messages = await _groupChatRepository.GetMessagesForGroupAsync(groupId);
            await BroadcastStatusUpdatesAsync(groupId, null, "group", seenChanges);
            return ServiceResult.Ok(messages.Select(ToGroupMessageDto));
        }

        public async Task<ServiceResult> CreateGroupMessageAsync(string userId, int groupId, CreateGroupMessageDto createGroupMessageDto)
        {
            var group = await _groupRepository.GetGroupByIdAsync(groupId);
            if (group == null)
                return ServiceResult.NotFound("Group not found");

            if (!CanAccessGroupChat(group, userId))
                return ServiceResult.Forbid("Only accepted group members and admin can send group chat messages");

            var trimmedMessageText = createGroupMessageDto.MessageText?.Trim();
            if (string.IsNullOrWhiteSpace(trimmedMessageText))
                return ServiceResult.BadRequest("Message text is required");

            var message = new GroupMessage
            {
                GroupId = groupId,
                SenderUserId = userId,
                MessageText = trimmedMessageText,
                CreatedAt = DateTime.UtcNow
            };

            var createdMessage = await _groupChatRepository.CreateMessageAsync(message);
            await _groupChatRepository.CreateMessageReceiptsAsync(GetGroupMessageReceipts(group, createdMessage.Id, userId));
            var messageDto = ToGroupMessageDto(createdMessage);

            await _hubContext.Clients
                .Group(ChatHub.GetGroupChannelName(groupId.ToString()))
                .SendAsync("ReceiveGroupMessage", messageDto);

            var notificationDto = new ChatMessageNotificationDto
            {
                Type = "group",
                GroupId = groupId,
                ConversationId = null,
                SenderUserId = messageDto.SenderUserId,
                SenderName = messageDto.SenderFullName,
                Preview = messageDto.MessageText,
                CreatedAt = messageDto.CreatedAt
            };

            foreach (var recipientUserId in GetGroupNotificationRecipientUserIds(group))
            {
                await _hubContext.Clients
                    .User(recipientUserId)
                    .SendAsync("ReceiveMessageNotification", notificationDto);
            }

            return ServiceResult.Ok(messageDto);
        }

        public async Task AcknowledgeMessageDeliveredAsync(string userId, int groupId, int messageId)
        {
            if (!await _groupChatRepository.IsGroupChatParticipantAsync(groupId, userId))
                return;

            var change = await _groupChatRepository.MarkMessageDeliveredAsync(groupId, messageId, userId, DateTime.UtcNow);
            await BroadcastStatusUpdateAsync(groupId, null, "group", change);
        }

        public async Task AcknowledgeMessageSeenAsync(string userId, int groupId, int messageId)
        {
            if (!await _groupChatRepository.IsGroupChatParticipantAsync(groupId, userId))
                return;

            var changes = await _groupChatRepository.MarkMessageSeenAsync(groupId, messageId, userId, DateTime.UtcNow);
            await BroadcastStatusUpdatesAsync(groupId, null, "group", changes);
        }

        private static bool CanAccessGroupChat(Group group, string userId)
        {
            return group.AdminId == userId
                || group.Memberships.Any(membership =>
                    membership.UserId == userId
                    && membership.Status == MembershipStatus.Accepted);
        }

        private static IReadOnlyList<string> GetGroupNotificationRecipientUserIds(Group group)
        {
            return group.Memberships
                .Where(membership => membership.Status == MembershipStatus.Accepted)
                .Select(membership => membership.UserId)
                .Append(group.AdminId)
                .Where(userId => !string.IsNullOrWhiteSpace(userId))
                .Distinct()
                .ToList();
        }

        private static IReadOnlyList<GroupMessageReceipt> GetGroupMessageReceipts(Group group, int messageId, string senderUserId)
        {
            return group.Memberships
                .Where(membership =>
                    membership.Status == MembershipStatus.Accepted
                    && membership.UserId != senderUserId)
                .Select(membership => new GroupMessageReceipt
                {
                    GroupMessageId = messageId,
                    UserId = membership.UserId
                })
                .Append(group.AdminId != senderUserId
                    ? new GroupMessageReceipt
                    {
                        GroupMessageId = messageId,
                        UserId = group.AdminId
                    }
                    : null)
                .Where(receipt => receipt != null)
                .Cast<GroupMessageReceipt>()
                .GroupBy(receipt => receipt.UserId)
                .Select(groupedReceipts => groupedReceipts.First())
                .ToList();
        }

        private static GroupMessageDto ToGroupMessageDto(GroupMessage message)
        {
            var seenReceipts = GetSeenReceipts(message);

            return new GroupMessageDto
            {
                Id = message.Id,
                GroupId = message.GroupId,
                SenderUserId = message.SenderUserId,
                SenderUsername = message.SenderUser?.UserName ?? string.Empty,
                SenderFullName = !string.IsNullOrWhiteSpace(message.SenderUser?.FullName)
                    ? message.SenderUser.FullName
                    : message.SenderUser?.UserName ?? string.Empty,
                SenderProfilePictureUrl = message.SenderUser?.ProfilePictureUrl ?? "default-profile.png",
                MessageText = message.MessageText,
                CreatedAt = BosniaTimeHelper.ToSarajevoOffset(message.CreatedAt),
                DeliveredAt = message.Receipts
                    .Where(receipt => receipt.DeliveredAt.HasValue)
                    .Select(receipt => (DateTime?)receipt.DeliveredAt)
                    .OrderBy(deliveredAt => deliveredAt)
                    .Select(deliveredAt => deliveredAt.HasValue ? BosniaTimeHelper.ToSarajevoOffset(deliveredAt.Value) : (DateTimeOffset?)null)
                    .FirstOrDefault(),
                SeenAt = message.Receipts
                    .Where(receipt => receipt.SeenAt.HasValue)
                    .Select(receipt => (DateTime?)receipt.SeenAt)
                    .OrderBy(seenAt => seenAt)
                    .Select(seenAt => seenAt.HasValue ? BosniaTimeHelper.ToSarajevoOffset(seenAt.Value) : (DateTimeOffset?)null)
                    .FirstOrDefault(),
                SeenByUserIds = seenReceipts
                    .Select(receipt => receipt.UserId)
                    .ToList(),
                SeenByUserNames = seenReceipts
                    .Select(receipt => !string.IsNullOrWhiteSpace(receipt.User?.FullName)
                        ? receipt.User.FullName
                        : receipt.User?.UserName ?? string.Empty)
                    .Where(name => !string.IsNullOrWhiteSpace(name))
                    .ToList(),
                SeenByUserProfilePictureUrls = seenReceipts
                    .Select(receipt => receipt.User?.ProfilePictureUrl ?? "default-profile.png")
                    .ToList()
            };
        }

        private async Task BroadcastStatusUpdatesAsync(
            int? groupId,
            int? conversationId,
            string chatType,
            IReadOnlyList<MessageStatusChange> changes)
        {
            foreach (var change in changes)
            {
                await BroadcastStatusUpdateAsync(groupId, conversationId, chatType, change);
            }
        }

        private async Task BroadcastStatusUpdateAsync(
            int? groupId,
            int? conversationId,
            string chatType,
            MessageStatusChange? change)
        {
            if (change == null)
                return;

            var updatedMessage = groupId.HasValue
                ? await _groupChatRepository.GetMessageByIdAsync(groupId.Value, change.MessageId)
                : null;
            var seenReceipts = updatedMessage != null
                ? GetSeenReceipts(updatedMessage)
                : Array.Empty<GroupMessageReceipt>();

            await _hubContext.Clients
                .Group(ChatHub.GetGroupChannelName(groupId?.ToString() ?? string.Empty))
                .SendAsync("ReceiveMessageStatusUpdate", new ChatMessageStatusUpdateDto
                {
                    MessageId = change.MessageId,
                    ChatType = chatType,
                    GroupId = groupId,
                    ConversationId = conversationId,
                    UserId = change.UserId,
                    DeliveredAt = change.DeliveredAt.HasValue ? BosniaTimeHelper.ToSarajevoOffset(change.DeliveredAt.Value) : null,
                    SeenAt = change.SeenAt.HasValue ? BosniaTimeHelper.ToSarajevoOffset(change.SeenAt.Value) : null,
                    SeenByUserIds = seenReceipts
                        .Select(receipt => receipt.UserId)
                        .ToList(),
                    SeenByUserNames = seenReceipts
                        .Select(receipt => !string.IsNullOrWhiteSpace(receipt.User?.FullName)
                            ? receipt.User.FullName
                            : receipt.User?.UserName ?? string.Empty)
                        .Where(name => !string.IsNullOrWhiteSpace(name))
                        .ToList(),
                    SeenByUserProfilePictureUrls = seenReceipts
                        .Select(receipt => receipt.User?.ProfilePictureUrl ?? "default-profile.png")
                        .ToList()
                });
        }

        private static IReadOnlyList<GroupMessageReceipt> GetSeenReceipts(GroupMessage message)
        {
            return message.Receipts
                .Where(receipt =>
                    receipt.UserId != message.SenderUserId
                    && receipt.SeenAt.HasValue)
                .OrderBy(receipt => receipt.SeenAt)
                .ToList();
        }
    }
}
