using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SportskiTerminiAPI.Interfaces;
using System.Security.Claims;

namespace SportskiTerminiAPI.Controllers.Admin
{
    [Route("api/admin/users")]
    [ApiController]
    [Authorize(Policy = "RequireAdminRole")]
    public class AdminUserController : ControllerBase
    {
        private readonly IUserService _userService;

        public AdminUserController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllUsers(
            [FromQuery] string? username,
            [FromQuery] string? role,
            [FromQuery] bool? locked)
        {
            var users = await _userService.GetAllUsersForAdminAsync(username, role, locked);
            return Ok(users);
        }

        [HttpPost("{id}/lock")]
        public async Task<IActionResult> LockUser(string id)
        {
            var callerId = User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (callerId == null)
                return Unauthorized();

            var result = await _userService.SetUserLockoutAsync(id, true, callerId);
            return StatusCode(result.StatusCode, result.Payload);
        }

        [HttpPost("{id}/unlock")]
        public async Task<IActionResult> UnlockUser(string id)
        {
            var callerId = User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (callerId == null)
                return Unauthorized();

            var result = await _userService.SetUserLockoutAsync(id, false, callerId);
            return StatusCode(result.StatusCode, result.Payload);
        }
    }
}
