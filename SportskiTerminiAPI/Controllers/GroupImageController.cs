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
    public class GroupImageController : ControllerBase
    {
        private readonly IGroupImageService _groupImageService;

        public GroupImageController(IGroupImageService groupImageService)
        {
            _groupImageService = groupImageService;
        }

        [HttpPost("{groupId}/upload-group-picture")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadGroupPicture(int groupId, [FromForm] UpdateGroupPictureDto groupPictureDto)
        {
            var userId = User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized();

            var result = await _groupImageService.UploadGroupPictureAsync(userId, groupId, groupPictureDto, Request.Scheme, Request.Host);
            return StatusCode(result.StatusCode, result.Payload);
        }

        [HttpDelete("{groupId}/delete-group-picture")]
        public async Task<IActionResult> DeleteGroupPicture(int groupId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized();

            var result = await _groupImageService.DeleteGroupPictureAsync(userId, groupId);
            return StatusCode(result.StatusCode, result.Payload);
        }
    }
}
