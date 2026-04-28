using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SportskiTerminiAPI.Interfaces;
using System.Security.Claims;

namespace SportskiTerminiAPI.Controllers
{
    [Route("api/group-chat-notifications")]
    [ApiController]
    [Authorize]
    public class GroupChatNotificationController : ControllerBase
    {
        private readonly IGroupChatNotificationService _groupChatNotificationService;

        public GroupChatNotificationController(IGroupChatNotificationService groupChatNotificationService)
        {
            _groupChatNotificationService = groupChatNotificationService;
        }

        [HttpGet]
        public async Task<IActionResult> GetMyChatNotifications()
        {
            var userId = User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized();

            var notifications = await _groupChatNotificationService.GetChatNotificationsAsync(userId);
            return Ok(notifications);
        }

        [HttpGet("unread-count")]
        public async Task<IActionResult> GetUnreadCount()
        {
            var userId = User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized();

            var count = await _groupChatNotificationService.GetUnreadCountAsync(userId);
            return Ok(new { count });
        }

        [HttpPost("{groupId:int}/mark-read")]
        public async Task<IActionResult> MarkGroupAsRead(int groupId)
        {
            var userId = User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized();

            var result = await _groupChatNotificationService.MarkGroupAsReadAsync(userId, groupId);
            return StatusCode(result.StatusCode, result.Payload);
        }
    }
}
