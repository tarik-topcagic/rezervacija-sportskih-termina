using SportskiTerminiAPI.DTOs;
using SportskiTerminiAPI.DTOs.Admin;
using SportskiTerminiAPI.Services;

namespace SportskiTerminiAPI.Interfaces
{
    public interface IUserService
    {
        Task<UserProfileDto?> GetMyProfileAsync(string userId);
        Task<UserProfileDto?> GetUserProfileByUsernameAsync(string username);
        Task<IEnumerable<UserProfileDto>> SearchUsersAsync(string? query, string? currentUserId);
        Task<IEnumerable<AdminUserDto>> GetAllUsersForAdminAsync(string? username, string? role, bool? locked);
        Task<ServiceResult> SetUserLockoutAsync(string userId, bool locked, string callerId);
    }
}
