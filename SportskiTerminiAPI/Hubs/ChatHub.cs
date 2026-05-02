using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using SportskiTerminiAPI.DTOs;
using SportskiTerminiAPI.Interfaces;
using System.Security.Claims;

namespace SportskiTerminiAPI.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
        private readonly IGroupChatService _groupChatService;
        private readonly IPrivateChatService _privateChatService;

        public ChatHub(
            IGroupChatService groupChatService,
            IPrivateChatService privateChatService)
        {
            _groupChatService = groupChatService;
            _privateChatService = privateChatService;
        }

        public async Task JoinGroup(string groupId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, GetGroupChannelName(groupId));
        }

        public async Task LeaveGroup(string groupId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, GetGroupChannelName(groupId));
        }

        public async Task JoinConversation(string conversationId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, GetConversationChannelName(conversationId));
        }

        public async Task LeaveConversation(string conversationId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, GetConversationChannelName(conversationId));
        }

        public async Task AcknowledgeGroupMessageDelivered(string groupId, int messageId)
        {
            var userId = GetCurrentUserId();
            if (userId == null || !int.TryParse(groupId, out var parsedGroupId))
                return;

            await _groupChatService.AcknowledgeMessageDeliveredAsync(userId, parsedGroupId, messageId);
        }

        public async Task AcknowledgeGroupMessageSeen(string groupId, int messageId)
        {
            var userId = GetCurrentUserId();
            if (userId == null || !int.TryParse(groupId, out var parsedGroupId))
                return;

            await _groupChatService.AcknowledgeMessageSeenAsync(userId, parsedGroupId, messageId);
        }

        public async Task AcknowledgePrivateMessageDelivered(string conversationId, int messageId)
        {
            var userId = GetCurrentUserId();
            if (userId == null || !int.TryParse(conversationId, out var parsedConversationId))
                return;

            await _privateChatService.AcknowledgeMessageDeliveredAsync(userId, parsedConversationId, messageId);
        }

        public async Task AcknowledgePrivateMessageSeen(string conversationId, int messageId)
        {
            var userId = GetCurrentUserId();
            if (userId == null || !int.TryParse(conversationId, out var parsedConversationId))
                return;

            await _privateChatService.AcknowledgeMessageSeenAsync(userId, parsedConversationId, messageId);
        }

        public async Task StartTyping(string type, string targetId)
        {
            var payload = CreateTypingPayload(type, targetId);
            if (payload == null)
                return;

            await Clients.Group(GetChannelName(type, targetId))
                .SendAsync("UserTyping", payload);
        }

        public async Task StopTyping(string type, string targetId)
        {
            var payload = CreateTypingPayload(type, targetId);
            if (payload == null)
                return;

            await Clients.Group(GetChannelName(type, targetId))
                .SendAsync("UserStoppedTyping", payload);
        }

        public static string GetGroupChannelName(string groupId)
        {
            return $"group-{groupId}";
        }

        public static string GetConversationChannelName(string conversationId)
        {
            return $"conversation-{conversationId}";
        }

        private string? GetCurrentUserId()
        {
            return Context.UserIdentifier
                ?? Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
        }

        private ChatTypingDto? CreateTypingPayload(string type, string targetId)
        {
            var userId = GetCurrentUserId();
            if (userId == null || string.IsNullOrWhiteSpace(targetId) || !IsSupportedType(type))
                return null;

            return new ChatTypingDto
            {
                UserId = userId,
                UserName = GetCurrentUserName(),
                Type = type,
                TargetId = targetId,
            };
        }

        private static string GetChannelName(string type, string targetId)
        {
            return type == "group"
                ? GetGroupChannelName(targetId)
                : GetConversationChannelName(targetId);
        }

        private static bool IsSupportedType(string type)
        {
            return type == "group" || type == "private";
        }

        private string GetCurrentUserName()
        {
            return Context.User?.Identity?.Name
                ?? Context.User?.FindFirstValue(ClaimTypes.Name)
                ?? Context.User?.FindFirstValue("unique_name")
                ?? Context.User?.FindFirstValue("name")
                ?? "User";
        }
    }
}
