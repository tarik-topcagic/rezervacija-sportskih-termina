namespace SportskiTerminiAPI.Models
{
    public class FavoriteArena
    {
        public int Id { get; set; }
        public int ArenaId { get; set; }
        public string UserId { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public virtual Arena Arena { get; set; } = null!;
        public virtual AppUser User { get; set; } = null!;
    }
}
