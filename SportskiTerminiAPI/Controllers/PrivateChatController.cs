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
    }
}
