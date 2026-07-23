using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SportskiTerminiAPI.DTOs;
using SportskiTerminiAPI.Interfaces;
using System.Security.Claims;

namespace SportskiTerminiAPI.Controllers
{
    [Route("api/private-chat")]
    [ApiController]
    [Authorize]
    public class PrivateChatController : ControllerBase
    {
        private readonly IPrivateChatService _privateChatService;

        public PrivateChatController(IPrivateChatService privateChatService)
        {
            _privateChatService = privateChatService;
        }

        [HttpGet("conversations")]
        public async Task<IActionResult> GetConversations()
        {
            var userId = User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized();

            var result = await _privateChatService.GetConversationsAsync(userId);
            return StatusCode(result.StatusCode, result.Payload);
        }

        [HttpGet("conversations/{conversationId:int}/messages")]
        public async Task<IActionResult> GetConversationMessages(int conversationId)
        {
            var userId = User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized();

            var result = await _privateChatService.GetConversationMessagesAsync(userId, conversationId);
            return StatusCode(result.StatusCode, result.Payload);
        }

        [HttpPost("users/{userId}/conversation")]
        public async Task<IActionResult> GetOrCreateConversation(string userId)
        {
            var currentUserId = User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (currentUserId == null)
                return Unauthorized();

            var result = await _privateChatService.GetOrCreateConversationAsync(currentUserId, userId);
            return StatusCode(result.StatusCode, result.Payload);
        }

        [HttpPost("users/{userId}/messages")]
        public async Task<IActionResult> CreateMessageForUser(string userId, [FromBody] CreatePrivateMessageDto createPrivateMessageDto)
        {
            var senderUserId = User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (senderUserId == null)
                return Unauthorized();

            var result = await _privateChatService.CreateMessageForUserAsync(senderUserId, userId, createPrivateMessageDto);
            return StatusCode(result.StatusCode, result.Payload);
        }

        [HttpPost("conversations/{conversationId:int}/messages")]
        public async Task<IActionResult> CreateMessageForConversation(int conversationId, [FromBody] CreatePrivateMessageDto createPrivateMessageDto)
        {
            var senderUserId = User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (senderUserId == null)
                return Unauthorized();

            var result = await _privateChatService.CreateMessageForConversationAsync(senderUserId, conversationId, createPrivateMessageDto);
            return StatusCode(result.StatusCode, result.Payload);
        }

        [HttpDelete("conversations/{conversationId:int}/messages/{messageId:int}")]
        public async Task<IActionResult> DeletePrivateMessage(int conversationId, int messageId)
        {
            var userId = User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized();

            var result = await _privateChatService.DeletePrivateMessageAsync(userId, conversationId, messageId);
            return StatusCode(result.StatusCode, result.Payload);
        }

        [HttpPost("conversations/{conversationId:int}/messages/{messageId:int}/pin")]
        public async Task<IActionResult> SetPrivateMessagePinned(int conversationId, int messageId, [FromBody] SetMessagePinnedDto setMessagePinnedDto)
        {
            var userId = User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized();

            var result = await _privateChatService.SetPrivateMessagePinnedAsync(userId, conversationId, messageId, setMessagePinnedDto.IsPinned);
            return StatusCode(result.StatusCode, result.Payload);
        }

        [HttpPost("conversations/{conversationId:int}/messages/{messageId:int}/reactions")]
        public async Task<IActionResult> AddOrUpdatePrivateMessageReaction(int conversationId, int messageId, [FromBody] AddReactionDto addReactionDto)
        {
            var userId = User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized();

            var result = await _privateChatService.AddOrUpdatePrivateMessageReactionAsync(userId, conversationId, messageId, addReactionDto.Emoji);
            return StatusCode(result.StatusCode, result.Payload);
        }

        [HttpDelete("conversations/{conversationId:int}/messages/{messageId:int}/reactions")]
        public async Task<IActionResult> RemovePrivateMessageReaction(int conversationId, int messageId)
        {
            var userId = User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized();

            var result = await _privateChatService.RemovePrivateMessageReactionAsync(userId, conversationId, messageId);
            return StatusCode(result.StatusCode, result.Payload);
        }
    }
}
