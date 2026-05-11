using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SportskiTerminiAPI.DTOs;
using SportskiTerminiAPI.Interfaces;
using System.Security.Claims;

namespace SportskiTerminiAPI.Controllers
{
    [Route("api/users")]
    [Authorize]
    [ApiController]
    public class UserSettingsController : ControllerBase
    {
        private readonly IUserSettingsService _userSettingsService;

        public UserSettingsController(IUserSettingsService userSettingsService)
        {
            _userSettingsService = userSettingsService;
        }

        [HttpGet("settings")]
        public async Task<IActionResult> GetSettings()
        {
            var userId = User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized();

            var settings = await _userSettingsService.GetSettingsAsync(userId);
            if (settings == null)
                return NotFound();

            return Ok(settings);
        }

        [HttpPut("settings/email-notifications")]
        public async Task<IActionResult> UpdateEmailNotifications([FromBody] UpdateEmailNotificationsDto dto)
        {
            var userId = User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized();

            var result = await _userSettingsService.UpdateEmailNotificationsAsync(userId, dto);
            return StatusCode(result.StatusCode, result.Payload);
        }

        [HttpPut("settings/language")]
        public async Task<IActionResult> UpdateLanguagePreference([FromBody] UpdateLanguagePreferenceDto dto)
        {
            var userId = User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized();

            var result = await _userSettingsService.UpdateLanguagePreferenceAsync(userId, dto);
            return StatusCode(result.StatusCode, result.Payload);
        }

        [HttpPut("settings/username")]
        public async Task<IActionResult> UpdateUsername([FromBody] UpdateUsernameDto dto)
        {
            var userId = User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized();

            var result = await _userSettingsService.UpdateUsernameAsync(userId, dto);
            return StatusCode(result.StatusCode, result.Payload);
        }
    }
}
