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

        public async Task<List<AppUser>> GetAllUsersForAdminAsync(string? username)
        {
            var query = _userManager.Users.AsQueryable();

            if (!string.IsNullOrWhiteSpace(username))
            {
                var normalizedSearch = username.Trim().ToLower();
                query = query.Where(u => u.UserName != null && u.UserName.ToLower().Contains(normalizedSearch));
            }

            return await query.ToListAsync();
        }

        public async Task<AppUser?> GetUserByIdAsync(string id)
        {
            return await _userManager.FindByIdAsync(id);
        }

        public async Task<AppUser?> GetUserByNormalizedUsernameAsync(string normalizedUsername)
        {
            return await _userManager.Users
                .SingleOrDefaultAsync(user => user.NormalizedUserName == normalizedUsername);
        }

        public async Task<bool> UsernameExistsAsync(string normalizedUsername, string excludedUserId)
        {
            return await _userManager.Users
                .AnyAsync(user => user.Id != excludedUserId && user.NormalizedUserName == normalizedUsername);
        }

        public async Task<List<AppUser>> SearchUsersAsync(string? searchTerm)
        {
            if (string.IsNullOrWhiteSpace(searchTerm))
            {
                return new List<AppUser>();
            }

            searchTerm = searchTerm.ToLower();

            return await _userManager.Users
                .Where(u => u.UserName.ToLower().Contains(searchTerm) ||
                            u.FullName.ToLower().Contains(searchTerm))
                .ToListAsync();
        }

        public async Task<IdentityResult> UpdateUserAsync(AppUser user)
        {
            return await _userManager.UpdateAsync(user);
        }

        public async Task<IdentityResult> UpdateSecurityStampAsync(AppUser user)
        {
            return await _userManager.UpdateSecurityStampAsync(user);
        }
    }
}
