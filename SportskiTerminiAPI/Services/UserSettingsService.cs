using Microsoft.AspNetCore.Identity;
using SportskiTerminiAPI.DTOs;
using SportskiTerminiAPI.Interfaces;
using SportskiTerminiAPI.Models;

namespace SportskiTerminiAPI.Services
{
    public class UserSettingsService : IUserSettingsService
    {
        private readonly IUserRepository _userRepository;
        private readonly UserManager<AppUser> _userManager;
        private readonly ITokenService _tokenService;

        public UserSettingsService(IUserRepository userRepository, UserManager<AppUser> userManager, ITokenService tokenService)
        {
            _userRepository = userRepository;
            _userManager = userManager;
            _tokenService = tokenService;
        }

        public async Task<UserSettingsDto?> GetSettingsAsync(string userId)
        {
            var user = await _userRepository.GetUserByIdAsync(userId);
            if (user == null)
                return null;

            return new UserSettingsDto
            {
                Username = user.UserName ?? string.Empty,
                Email = user.Email ?? string.Empty,
                PhoneNumber = user.PhoneNumber ?? string.Empty,
                EmailNotificationsEnabled = user.EmailNotificationsEnabled
            };
        }

        public async Task<ServiceResult> UpdateEmailNotificationsAsync(string userId, UpdateEmailNotificationsDto dto)
        {
            var user = await _userRepository.GetUserByIdAsync(userId);
            if (user == null)
                return ServiceResult.NotFound();

            user.EmailNotificationsEnabled = dto.EmailNotificationsEnabled;

            var result = await _userRepository.UpdateUserAsync(user);
            if (!result.Succeeded)
                return ServiceResult.BadRequest(result.Errors);

            return ServiceResult.Ok(new { message = "Postavke obavijesti su sačuvane." });
        }

        public async Task<ServiceResult> UpdateUsernameAsync(string userId, UpdateUsernameDto dto)
        {
            var newUsername = dto.Username.Trim();
            if (string.IsNullOrWhiteSpace(newUsername))
                return ServiceResult.BadRequest(new { field = "username", message = "Korisničko ime je obavezno." });

            var user = await _userRepository.GetUserByIdAsync(userId);
            if (user == null)
                return ServiceResult.NotFound();

            if (string.Equals(user.UserName, newUsername, StringComparison.Ordinal))
            {
                var currentToken = await _tokenService.GenerateJwtToken(user);
                return ServiceResult.Ok(new { token = currentToken, username = user.UserName, fullName = user.FullName });
            }

            var normalizedUsername = _userManager.NormalizeName(newUsername);
            var usernameExists = await _userRepository.UsernameExistsAsync(normalizedUsername, user.Id);

            if (usernameExists)
                return ServiceResult.BadRequest(new { field = "username", message = "Korisničko ime je već u upotrebi" });

            user.UserName = newUsername;
            user.NormalizedUserName = normalizedUsername;

            var updateResult = await _userRepository.UpdateUserAsync(user);
            if (!updateResult.Succeeded)
                return ServiceResult.BadRequest(updateResult.Errors);

            var stampResult = await _userRepository.UpdateSecurityStampAsync(user);
            if (!stampResult.Succeeded)
                return ServiceResult.BadRequest(stampResult.Errors);

            var updatedUser = await _userRepository.GetUserByIdAsync(user.Id);
            if (updatedUser == null)
                return ServiceResult.NotFound();

            var token = await _tokenService.GenerateJwtToken(updatedUser);

            return ServiceResult.Ok(new
            {
                token,
                username = updatedUser.UserName,
                fullName = updatedUser.FullName
            });
        }
    }
}
