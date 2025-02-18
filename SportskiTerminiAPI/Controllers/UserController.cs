using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using SportskiTerminiAPI.DTOs;
using SportskiTerminiAPI.Interfaces;
using SportskiTerminiAPI.Models;
using System.Security.Claims;

namespace SportskiTerminiAPI.Controllers
{
    [Route("api/users")]
    [Authorize]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserRepository _userRepository;
        public UserController(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        [HttpGet("my-profile")]
        public async Task<IActionResult> GetMyProfile()
        {
            var userId = User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized();

            var user = await _userRepository.GetUserByIdAsync(userId);
            if (user == null) 
                return NotFound();

            var profileDto = new UserProfileDto()
            {
                Username = user.UserName,
                FullName = user.FullName,
                PhoneNumber = user.PhoneNumber,
                ProfilePictureUrl = user.ProfilePictureUrl,
                Location = user.Location
            };

            return Ok(profileDto);
        }

        [HttpPut("update-user")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto updateProfileDto)
        {
            var userId = User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized();

            var user = await _userRepository.GetUserByIdAsync(userId);
            if (user == null)
                return NotFound();

            user.FullName = updateProfileDto.FullName;
            user.ProfilePictureUrl = updateProfileDto.ProfilePictureUrl ?? "default-profile.png";
            user.PhoneNumber = updateProfileDto.PhoneNumber;
            user.Location = updateProfileDto.Location;

            var result = await _userRepository.UpdateUserAsync(user);
            if (!result.Succeeded)
                return BadRequest(result.Errors);

            return Ok(result);
        }

        [HttpPost("upload-profile-picture")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadProfilePicture([FromForm] UpdateProfilePictureDto updateProfilePictureDto)
        {
            if (updateProfilePictureDto.File == null || updateProfilePictureDto.File.Length == 0)
                return BadRequest("Nije odabrana slika.");

            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "profilna");
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            var fileName = Guid.NewGuid().ToString() + Path.GetExtension(updateProfilePictureDto.File.FileName);
            var filePath = Path.Combine(uploadsFolder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await updateProfilePictureDto.File.CopyToAsync(stream);
            }

            var imageUrl = $"{Request.Scheme}://{Request.Host}/uploads/profilna/{fileName}";

            return Ok(new { imageUrl });
        }

        [HttpDelete("delete-profile-picture")]
        public async Task<IActionResult> DeleteProfilePicture()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) 
                return Unauthorized();

            var user = await _userRepository.GetUserByIdAsync(userId);
            if (user == null) 
                return NotFound();

            if (!string.IsNullOrEmpty(user.ProfilePictureUrl) &&
                user.ProfilePictureUrl.ToLower() != "default-profile.png")
            {
                var uri = new Uri(user.ProfilePictureUrl);
                var fileName = Path.GetFileName(uri.AbsolutePath);
                var filePath = Path.Combine
                (
                    Directory.GetCurrentDirectory(),
                    "wwwroot",
                    "uploads",
                    "profilna",
                    fileName
                );

                if (System.IO.File.Exists(filePath))
                {
                    System.IO.File.Delete(filePath);
                }
            }

            user.ProfilePictureUrl = "default-profile.png";
            var result = await _userRepository.UpdateUserAsync(user);

            return result.Succeeded ? Ok() : BadRequest(result.Errors);
        }
    }
}
