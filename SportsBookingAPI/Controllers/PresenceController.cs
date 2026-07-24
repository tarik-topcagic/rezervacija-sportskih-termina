using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SportsBookingAPI.Interfaces;
using System.Security.Claims;

namespace SportsBookingAPI.Controllers
{
    [Route("api/presence")]
    [ApiController]
    [Authorize]
    public class PresenceController : ControllerBase
    {
        private readonly IPresenceAccessService _presenceAccessService;

        public PresenceController(IPresenceAccessService presenceAccessService)
        {
            _presenceAccessService = presenceAccessService;
        }

        [HttpGet("users/{userId}")]
        public async Task<IActionResult> GetUserPresence(string userId)
        {
            var viewerUserId = User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (viewerUserId == null)
            {
                return Unauthorized();
            }

            var result = await _presenceAccessService.GetUserPresenceAsync(viewerUserId, userId);
            return StatusCode(result.StatusCode, result.Payload);
        }

        [HttpGet("groups/{groupId:int}")]
        public async Task<IActionResult> GetGroupPresence(int groupId)
        {
            var viewerUserId = User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (viewerUserId == null)
            {
                return Unauthorized();
            }

            var result = await _presenceAccessService.GetGroupPresenceAsync(viewerUserId, groupId);
            return StatusCode(result.StatusCode, result.Payload);
        }
    }
}
