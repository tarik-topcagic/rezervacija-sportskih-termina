using Microsoft.AspNetCore.Identity;

namespace SportskiTerminiAPI.Models
{
    public class AppUser : IdentityUser
    {
        public string FullName { get; set; } = string.Empty;
        public string ProfilePictureUrl { get; set; } = "default-profile.png";
        public string Location { get; set; } = string.Empty;
    }
}
