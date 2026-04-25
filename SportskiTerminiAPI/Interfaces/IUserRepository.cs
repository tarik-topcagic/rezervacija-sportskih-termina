using Microsoft.AspNetCore.Identity;
using SportskiTerminiAPI.Models;

namespace SportskiTerminiAPI.Interfaces
{
    public interface IUserRepository
    {
        Task<AppUser?> GetUserByIdAsync(string id);
        Task<AppUser?> GetUserByNormalizedUsernameAsync(string normalizedUsername);
        Task<bool> UsernameExistsAsync(string normalizedUsername, string excludedUserId);
        Task<IdentityResult> UpdateUserAsync(AppUser user);
        Task<IdentityResult> UpdateSecurityStampAsync(AppUser user);
        Task<List<AppUser>> GetAllUsersAsync();
        Task<List<AppUser>> SearchUsersAsync(string? searchTerm);
    }
}
