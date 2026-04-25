using SportskiTerminiAPI.DTOs;

namespace SportskiTerminiAPI.Interfaces
{
    public interface IUserService
    {
        Task<UserProfileDto?> GetMyProfileAsync(string userId);
        Task<UserProfileDto?> GetUserProfileByUsernameAsync(string username);
        Task<IEnumerable<UserProfileDto>> SearchUsersAsync(string? query, string? currentUserId);
    }
}
