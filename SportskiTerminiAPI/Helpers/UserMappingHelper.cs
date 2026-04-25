using SportskiTerminiAPI.DTOs;
using SportskiTerminiAPI.Models;

namespace SportskiTerminiAPI.Helpers
{
    public static class UserMappingHelper
    {
        public static UserProfileDto ToUserProfileDto(AppUser user)
        {
            return new UserProfileDto
            {
                Id = user.Id,
                Username = user.UserName,
                FullName = user.FullName,
                PhoneNumber = user.PhoneNumber,
                ProfilePictureUrl = user.ProfilePictureUrl,
                Location = user.Location
            };
        }
    }
}
