using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SportskiTerminiAPI.DTOs;
using SportskiTerminiAPI.Interfaces;
using System.Security.Claims;

namespace SportskiTerminiAPI.Controllers
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
    }
}
