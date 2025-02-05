using Microsoft.AspNetCore.Identity;

namespace SportskiTerminiAPI.Models
{
    public class AppUser : IdentityUser
    {
        public string FullName { get; set; } = string.Empty;
    }
}
