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
    public class UserProfileController : ControllerBase
    {
        private readonly IUserProfileService _userProfileService;

        public UserProfileController(IUserProfileService userProfileService)
        {
            _userProfileService = userProfileService;
        }

        [HttpPut("update-user")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto updateProfileDto)
        {
            var userId = User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized();

            var result = await _userProfileService.UpdateProfileAsync(userId, updateProfileDto);
            return StatusCode(result.StatusCode, result.Payload);
        }

        [HttpPost("upload-profile-picture")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadProfilePicture([FromForm] UpdateProfilePictureDto updateProfilePictureDto)
        {
            var result = await _userProfileService.UploadProfilePictureAsync(updateProfilePictureDto, Request.Scheme, Request.Host);
            return StatusCode(result.StatusCode, result.Payload);
        }

        [HttpDelete("delete-profile-picture")]
        public async Task<IActionResult> DeleteProfilePicture()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized();

            var result = await _userProfileService.DeleteProfilePictureAsync(userId);
            return StatusCode(result.StatusCode, result.Payload);
        }
    }
}
