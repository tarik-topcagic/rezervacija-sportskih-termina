using Microsoft.AspNetCore.SignalR;
using SportskiTerminiAPI.Hubs;
using SportskiTerminiAPI.DTOs;
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

            var messages = await _groupChatRepository.GetMessagesForGroupAsync(groupId);
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
            var messageDto = ToGroupMessageDto(createdMessage);

            await _hubContext.Clients
                .Group(ChatHub.GetGroupChannelName(groupId.ToString()))
                .SendAsync("ReceiveGroupMessage", messageDto);

            await _hubContext.Clients
                .Users(GetGroupNotificationRecipientUserIds(group))
                .SendAsync("ReceiveMessageNotification", new ChatMessageNotificationDto
                {
                    Type = "group",
                    GroupId = groupId,
                    ConversationId = null,
                    SenderUserId = messageDto.SenderUserId,
                    SenderName = messageDto.SenderFullName,
                    Preview = messageDto.MessageText,
                    CreatedAt = messageDto.CreatedAt
                });

            return ServiceResult.Ok(messageDto);
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

        private static GroupMessageDto ToGroupMessageDto(GroupMessage message)
        {
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
                CreatedAt = message.CreatedAt
            };
        }
    }
}
