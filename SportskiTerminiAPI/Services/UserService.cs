using Microsoft.AspNetCore.Identity;
using SportskiTerminiAPI.DTOs;
using SportskiTerminiAPI.Helpers;
using SportskiTerminiAPI.Interfaces;
using SportskiTerminiAPI.Models;

namespace SportskiTerminiAPI.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;
        private readonly UserManager<AppUser> _userManager;

        public UserService(IUserRepository userRepository, UserManager<AppUser> userManager)
        {
            _userRepository = userRepository;
            _userManager = userManager;
        }

        public async Task<UserProfileDto?> GetMyProfileAsync(string userId)
        {
            var user = await _userRepository.GetUserByIdAsync(userId);
            return user == null ? null : UserMappingHelper.ToUserProfileDto(user);
        }

        public async Task<UserProfileDto?> GetUserProfileByUsernameAsync(string username)
        {
            var normalizedUsername = _userManager.NormalizeName(username.Trim());
            var user = await _userRepository.GetUserByNormalizedUsernameAsync(normalizedUsername);

            return user == null ? null : UserMappingHelper.ToUserProfileDto(user);
        }

        public async Task<IEnumerable<UserProfileDto>> SearchUsersAsync(string? query, string? currentUserId)
        {
            if (string.IsNullOrWhiteSpace(query))
            {
                var allUsers = await _userRepository.GetAllUsersAsync();
                return allUsers
                    .Where(user => user.Id != currentUserId)
                    .Select(UserMappingHelper.ToUserProfileDto);
            }

            var loweredQuery = query.ToLower();
            var users = await _userRepository.SearchUsersAsync(query);

            return users
                .Where(user => user.Id != currentUserId
                    || (user.Id == currentUserId
                        && ((user.UserName != null && user.UserName.ToLower().Contains(loweredQuery))
                            || (user.FullName != null && user.FullName.ToLower().Contains(loweredQuery)))))
                .Select(UserMappingHelper.ToUserProfileDto);
        }
    }
}
