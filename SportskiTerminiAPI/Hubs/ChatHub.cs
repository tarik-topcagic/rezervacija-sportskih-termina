using Microsoft.AspNetCore.SignalR;

namespace SportskiTerminiAPI.Hubs
{
    public class ChatHub : Hub
    {
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

        public static string GetGroupChannelName(string groupId)
        {
            return $"group-{groupId}";
        }

        public static string GetConversationChannelName(string conversationId)
        {
            return $"conversation-{conversationId}";
        }
    }
}
