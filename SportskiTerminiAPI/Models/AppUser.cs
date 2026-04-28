using Microsoft.AspNetCore.Identity;

namespace SportskiTerminiAPI.Models
{
    public class AppUser : IdentityUser
    {
        public string FullName { get; set; } = string.Empty;
        public string ProfilePictureUrl { get; set; } = "default-profile.png";
        public string Location { get; set; } = string.Empty;
        public bool EmailNotificationsEnabled { get; set; }
        public virtual ICollection<GroupMembership> GroupMemberships { get; set; } = new List<GroupMembership>();
        public virtual ICollection<Group> Groups { get; set; } = new List<Group>();
        public virtual ICollection<GroupMessage> GroupMessages { get; set; } = new List<GroupMessage>();
        public virtual ICollection<AppNotification> Notifications { get; set; } = new List<AppNotification>();
    }
}
