namespace SportsBookingAPI.DTOs
{
    public class GroupDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string Grad { get; set; } = string.Empty;
        public string KategorijaSporta { get; set; } = string.Empty;
        public string AdminId { get; set; }
        public string AdminDisplayName { get; set; } = string.Empty;
        public string AdminUsername { get; set; } = string.Empty;
        public DateTime DateCreated { get; set; }
        public string ImageUrl { get; set; }
        public int MembersCount { get; set; }
    }
}
