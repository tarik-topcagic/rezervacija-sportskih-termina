using Microsoft.AspNetCore.Identity;
using SportskiTerminiAPI.Models;

namespace SportskiTerminiAPI.Interfaces
{
    public interface IUserRepository
    {
        Task<AppUser?> GetUserByIdAsync(string id);
        Task<IdentityResult> UpdateUserAsync(AppUser user);
        Task<List<AppUser>> GetAllUsersAsync();
        Task<List<AppUser>> SearchUsersAsync(string? searchTerm);
    }
}
