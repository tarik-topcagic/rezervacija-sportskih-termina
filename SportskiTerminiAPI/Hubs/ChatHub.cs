using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
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
    }
}
