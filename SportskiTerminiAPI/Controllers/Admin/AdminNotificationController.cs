using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SportskiTerminiAPI.Interfaces;
using SportskiTerminiAPI.Models;

namespace SportskiTerminiAPI.Controllers.Admin
{
    [Route("api/admin/notifications")]
    [ApiController]
    [Authorize(Policy = "RequireAdminRole")]
    public class AdminNotificationController : ControllerBase
    {
        private readonly INotificationService _notificationService;

        public AdminNotificationController(INotificationService notificationService)
        {
            _notificationService = notificationService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllNotifications(
            [FromQuery] AppNotificationType? type,
            [FromQuery] bool? isRead,
            [FromQuery] string? username)
        {
            var notifications = await _notificationService.GetAllNotificationsForAdminAsync(type, isRead, username);
            return Ok(notifications);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNotification(int id)
        {
            var result = await _notificationService.AdminDeleteNotificationAsync(id);
            return StatusCode(result.StatusCode, result.Payload);
        }
    }
}
