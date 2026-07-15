using SportskiTerminiAPI.DTOs.Admin;
using SportskiTerminiAPI.Models;

namespace SportskiTerminiAPI.Helpers.Admin
{
    public static class AdminUserMappingHelper
    {
        public static AdminUserDto ToAdminUserDto(AppUser user, IList<string> roles)
        {
            return new AdminUserDto
            {
                Id = user.Id,
                UserName = user.UserName,
                FullName = user.FullName,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                LockoutEnd = user.LockoutEnd,
                EmailConfirmed = user.EmailConfirmed,
                CreatedAt = user.CreatedAt,
                Roles = roles.ToList()
            };
        }
    }
}
