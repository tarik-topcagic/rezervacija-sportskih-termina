namespace SportskiTerminiAPI.DTOs
{
    public class FavoriteArenaDto
    {
        public int Id { get; set; }
        public int ArenaId { get; set; }
        public string ArenaName { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string SportType { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
        public decimal PricePerHour { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
