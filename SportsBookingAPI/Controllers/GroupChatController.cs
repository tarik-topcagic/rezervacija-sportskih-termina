using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SportsBookingAPI.DTOs;
using SportsBookingAPI.Interfaces;
using System.Security.Claims;

namespace SportsBookingAPI.Controllers
{
    [Route("api/groups")]
    [ApiController]
    [Authorize]
    public class GroupChatController : ControllerBase
    {
        private readonly IGroupChatService _groupChatService;

        public GroupChatController(IGroupChatService groupChatService)
        {
            _groupChatService = groupChatService;
        }

        [HttpGet("{groupId}/messages")]
        public async Task<IActionResult> GetGroupMessages(int groupId)
        {
            var userId = User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized();

            var result = await _groupChatService.GetGroupMessagesAsync(userId, groupId);
            return StatusCode(result.StatusCode, result.Payload);
        }

        [HttpPost("{groupId}/messages")]
        public async Task<IActionResult> CreateGroupMessage(int groupId, [FromBody] CreateGroupMessageDto createGroupMessageDto)
        {
            var userId = User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized();

            var result = await _groupChatService.CreateGroupMessageAsync(userId, groupId, createGroupMessageDto);
            return StatusCode(result.StatusCode, result.Payload);
        }

        [HttpDelete("{groupId}/messages/{messageId}")]
        public async Task<IActionResult> DeleteGroupMessage(int groupId, int messageId)
        {
            var userId = User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized();

            var result = await _groupChatService.DeleteGroupMessageAsync(userId, groupId, messageId);
            return StatusCode(result.StatusCode, result.Payload);
        }

        [HttpPost("{groupId}/messages/{messageId}/pin")]
        public async Task<IActionResult> SetGroupMessagePinned(int groupId, int messageId, [FromBody] SetMessagePinnedDto setMessagePinnedDto)
        {
            var userId = User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized();

            var result = await _groupChatService.SetGroupMessagePinnedAsync(userId, groupId, messageId, setMessagePinnedDto.IsPinned);
            return StatusCode(result.StatusCode, result.Payload);
        }

        [HttpPost("{groupId}/messages/{messageId}/reactions")]
        public async Task<IActionResult> AddOrUpdateGroupMessageReaction(int groupId, int messageId, [FromBody] AddReactionDto addReactionDto)
        {
            var userId = User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized();

            var result = await _groupChatService.AddOrUpdateGroupMessageReactionAsync(userId, groupId, messageId, addReactionDto.Emoji);
            return StatusCode(result.StatusCode, result.Payload);
        }

        [HttpDelete("{groupId}/messages/{messageId}/reactions")]
        public async Task<IActionResult> RemoveGroupMessageReaction(int groupId, int messageId)
        {
            var userId = User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized();

            var result = await _groupChatService.RemoveGroupMessageReactionAsync(userId, groupId, messageId);
            return StatusCode(result.StatusCode, result.Payload);
        }
    }
}
