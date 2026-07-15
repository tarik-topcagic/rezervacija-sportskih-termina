namespace SportskiTerminiAPI.DTOs.Admin
{
    public class AdminUserDto
    {
        public string Id { get; set; } = string.Empty;
        public string? UserName { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? PhoneNumber { get; set; }
        public DateTimeOffset? LockoutEnd { get; set; }
        public bool EmailConfirmed { get; set; }
        public DateTime? CreatedAt { get; set; }
        public List<string> Roles { get; set; } = new List<string>();
    }
}
