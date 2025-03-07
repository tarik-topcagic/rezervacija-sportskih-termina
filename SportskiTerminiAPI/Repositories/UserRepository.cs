using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using SportskiTerminiAPI.Interfaces;
using SportskiTerminiAPI.Models;

namespace SportskiTerminiAPI.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly UserManager<AppUser> _userManager;
        public UserRepository(UserManager<AppUser> userManager)
        {
            _userManager = userManager;
        }

        public async Task<List<AppUser>> GetAllUsersAsync()
        {
            return await _userManager.Users.ToListAsync();
        }

        public async Task<AppUser?> GetUserByIdAsync(string id)
        {
            return await _userManager.FindByIdAsync(id);
        }

        public async Task<List<AppUser>> SearchUsersAsync(string? searchTerm)
        {
            if (string.IsNullOrWhiteSpace(searchTerm))
            {
                return new List<AppUser>();
            }

            searchTerm = searchTerm.ToLower();

            var users = await _userManager.Users
                .Where(u => u.UserName.ToLower().Contains(searchTerm) ||
                       u.FullName.ToLower().Contains(searchTerm))
                .ToListAsync();

            return users;
        }

        public async Task<IdentityResult> UpdateUserAsync(AppUser user)
        {
            return await _userManager.UpdateAsync(user);
        }
    }
}
