using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SportsBookingAPI.Interfaces;
using System.Security.Claims;

namespace SportsBookingAPI.Controllers
{
    [Route("api/private-chat-notifications")]
    [ApiController]
    [Authorize]
    public class PrivateChatNotificationController : ControllerBase
    {
        private readonly IPrivateChatNotificationService _privateChatNotificationService;

        public PrivateChatNotificationController(IPrivateChatNotificationService privateChatNotificationService)
        {
            _privateChatNotificationService = privateChatNotificationService;
        }

        [HttpGet]
        public async Task<IActionResult> GetMyChatNotifications()
        {
            var userId = User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized();

            var notifications = await _privateChatNotificationService.GetChatNotificationsAsync(userId);
            return Ok(notifications);
        }

        [HttpGet("unread-count")]
        public async Task<IActionResult> GetUnreadCount()
        {
            var userId = User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized();

            var count = await _privateChatNotificationService.GetUnreadCountAsync(userId);
            return Ok(new { count });
        }

        [HttpPost("{conversationId:int}/mark-read")]
        public async Task<IActionResult> MarkConversationAsRead(int conversationId)
        {
            var userId = User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized();

            var result = await _privateChatNotificationService.MarkConversationAsReadAsync(userId, conversationId);
            return StatusCode(result.StatusCode, result.Payload);
        }
    }
}
