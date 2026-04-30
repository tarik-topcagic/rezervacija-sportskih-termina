using Microsoft.AspNetCore.SignalR;
using SportskiTerminiAPI.Hubs;
using SportskiTerminiAPI.DTOs;
using SportskiTerminiAPI.Interfaces;
using SportskiTerminiAPI.Models;

namespace SportskiTerminiAPI.Services
{
    public class PrivateChatService : IPrivateChatService
    {
        private readonly IPrivateChatRepository _privateChatRepository;
        private readonly IHubContext<ChatHub> _hubContext;

        public PrivateChatService(
            IPrivateChatRepository privateChatRepository,
            IHubContext<ChatHub> hubContext)
        {
            _privateChatRepository = privateChatRepository;
            _hubContext = hubContext;
        }

        public async Task<ServiceResult> GetConversationsAsync(string userId)
        {
            var conversations = await _privateChatRepository.GetConversationsForUserAsync(userId);
            return ServiceResult.Ok(conversations.Select(conversation => ToPrivateConversationDto(conversation, userId)));
        }

        public async Task<ServiceResult> GetConversationMessagesAsync(string userId, int conversationId)
        {
            var conversation = await _privateChatRepository.GetConversationByIdAsync(conversationId);
            if (conversation == null)
                return ServiceResult.NotFound("Conversation not found");

            if (!IsConversationParticipant(conversation, userId))
                return ServiceResult.Forbid("Only conversation participants can access private messages");

            var messages = await _privateChatRepository.GetMessagesForConversationAsync(conversationId);
            return ServiceResult.Ok(messages.Select(ToPrivateMessageDto));
        }

        public async Task<ServiceResult> GetOrCreateConversationAsync(string currentUserId, string targetUserId)
        {
            if (currentUserId == targetUserId)
                return ServiceResult.BadRequest("You cannot start a private conversation with yourself");

            var targetUser = await _privateChatRepository.GetUserByIdAsync(targetUserId);
            if (targetUser == null)
                return ServiceResult.NotFound("Target user not found");

            var conversation = await GetOrCreateConversationEntityAsync(currentUserId, targetUserId);
            return ServiceResult.Ok(ToPrivateConversationDto(conversation, currentUserId));
        }

        public async Task<ServiceResult> CreateMessageForUserAsync(string senderUserId, string targetUserId, CreatePrivateMessageDto createPrivateMessageDto)
        {
            if (senderUserId == targetUserId)
                return ServiceResult.BadRequest("You cannot send a private message to yourself");

            var targetUser = await _privateChatRepository.GetUserByIdAsync(targetUserId);
            if (targetUser == null)
                return ServiceResult.NotFound("Target user not found");

            var trimmedMessageText = createPrivateMessageDto.MessageText?.Trim();
            if (string.IsNullOrWhiteSpace(trimmedMessageText))
                return ServiceResult.BadRequest("Message text is required");

            var conversation = await GetOrCreateConversationEntityAsync(senderUserId, targetUserId);

            var message = new PrivateMessage
            {
                ConversationId = conversation.Id,
                SenderUserId = senderUserId,
                MessageText = trimmedMessageText,
                CreatedAt = DateTime.UtcNow
            };

            var createdMessage = await _privateChatRepository.CreateMessageAsync(message);
            var messageDto = ToPrivateMessageDto(createdMessage);

            await _hubContext.Clients
                .Group(ChatHub.GetConversationChannelName(conversation.Id.ToString()))
                .SendAsync("ReceivePrivateMessage", messageDto);

            await _hubContext.Clients
                .Users(GetConversationNotificationRecipientUserIds(conversation, senderUserId, targetUserId))
                .SendAsync("ReceiveMessageNotification", new ChatMessageNotificationDto
                {
                    Type = "private",
                    GroupId = null,
                    ConversationId = conversation.Id,
                    SenderUserId = messageDto.SenderUserId,
                    SenderName = messageDto.SenderFullName,
                    Preview = messageDto.MessageText,
                    CreatedAt = messageDto.CreatedAt
                });

            return ServiceResult.Ok(messageDto);
        }

        public async Task<ServiceResult> CreateMessageForConversationAsync(string senderUserId, int conversationId, CreatePrivateMessageDto createPrivateMessageDto)
        {
            var conversation = await _privateChatRepository.GetConversationByIdAsync(conversationId);
            if (conversation == null)
                return ServiceResult.NotFound("Conversation not found");

            if (!IsConversationParticipant(conversation, senderUserId))
                return ServiceResult.Forbid("Only conversation participants can send private messages");

            var trimmedMessageText = createPrivateMessageDto.MessageText?.Trim();
            if (string.IsNullOrWhiteSpace(trimmedMessageText))
                return ServiceResult.BadRequest("Message text is required");

            var message = new PrivateMessage
            {
                ConversationId = conversation.Id,
                SenderUserId = senderUserId,
                MessageText = trimmedMessageText,
                CreatedAt = DateTime.UtcNow
            };

            var createdMessage = await _privateChatRepository.CreateMessageAsync(message);
            var messageDto = ToPrivateMessageDto(createdMessage);

            await _hubContext.Clients
                .Group(ChatHub.GetConversationChannelName(conversation.Id.ToString()))
                .SendAsync("ReceivePrivateMessage", messageDto);

            await _hubContext.Clients
                .Users(GetConversationNotificationRecipientUserIds(conversation))
                .SendAsync("ReceiveMessageNotification", new ChatMessageNotificationDto
                {
                    Type = "private",
                    GroupId = null,
                    ConversationId = conversation.Id,
                    SenderUserId = messageDto.SenderUserId,
                    SenderName = messageDto.SenderFullName,
                    Preview = messageDto.MessageText,
                    CreatedAt = messageDto.CreatedAt
                });

            return ServiceResult.Ok(messageDto);
        }

        private static bool IsConversationParticipant(PrivateConversation conversation, string userId)
        {
            return conversation.UserOneId == userId || conversation.UserTwoId == userId;
        }

        private static IReadOnlyList<string> GetConversationNotificationRecipientUserIds(
            PrivateConversation conversation,
            params string[] fallbackUserIds)
        {
            var conversationUserIds = new[] { conversation.UserOneId, conversation.UserTwoId }
                .Where(userId => !string.IsNullOrWhiteSpace(userId));

            var resolvedUserIds = conversationUserIds.Any()
                ? conversationUserIds
                : fallbackUserIds.Where(userId => !string.IsNullOrWhiteSpace(userId));

            return resolvedUserIds
                .Distinct()
                .ToList();
        }

        private async Task<PrivateConversation> GetOrCreateConversationEntityAsync(string firstUserId, string secondUserId)
        {
            var (userOneId, userTwoId) = NormalizeUserPair(firstUserId, secondUserId);

            var conversation = await _privateChatRepository.GetConversationBetweenUsersAsync(userOneId, userTwoId);
            if (conversation != null)
                return conversation;

            return await _privateChatRepository.CreateConversationAsync(new PrivateConversation
            {
                UserOneId = userOneId,
                UserTwoId = userTwoId,
                CreatedAt = DateTime.UtcNow
            });
        }

        private static (string UserOneId, string UserTwoId) NormalizeUserPair(string firstUserId, string secondUserId)
        {
            return string.CompareOrdinal(firstUserId, secondUserId) <= 0
                ? (firstUserId, secondUserId)
                : (secondUserId, firstUserId);
        }

        private static PrivateConversationDto ToPrivateConversationDto(PrivateConversation conversation, string currentUserId)
        {
            var otherUser = conversation.UserOneId == currentUserId
                ? conversation.UserTwo
                : conversation.UserOne;

            var latestMessage = conversation.PrivateMessages
                .OrderByDescending(message => message.CreatedAt)
                .FirstOrDefault();

            return new PrivateConversationDto
            {
                Id = conversation.Id,
                OtherUserId = otherUser?.Id ?? string.Empty,
                OtherUsername = otherUser?.UserName ?? string.Empty,
                OtherFullName = !string.IsNullOrWhiteSpace(otherUser?.FullName)
                    ? otherUser.FullName
                    : otherUser?.UserName ?? string.Empty,
                OtherProfilePictureUrl = otherUser?.ProfilePictureUrl ?? "default-profile.png",
                LatestMessagePreview = latestMessage?.MessageText,
                LatestMessageCreatedAt = latestMessage?.CreatedAt,
                CreatedAt = conversation.CreatedAt
            };
        }

        private static PrivateMessageDto ToPrivateMessageDto(PrivateMessage message)
        {
            return new PrivateMessageDto
            {
                Id = message.Id,
                ConversationId = message.ConversationId,
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
