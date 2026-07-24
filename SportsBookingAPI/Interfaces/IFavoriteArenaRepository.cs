using SportsBookingAPI.Models;

namespace SportsBookingAPI.Interfaces
{
    public interface IFavoriteArenaRepository
    {
        Task<FavoriteArena> AddAsync(FavoriteArena favoriteArena);
        Task<FavoriteArena?> GetAsync(string userId, int arenaId);
        Task<IEnumerable<FavoriteArena>> GetForUserAsync(string userId);
        Task RemoveAsync(int id);
        Task<bool> ArenaHasFavoritesAsync(int arenaId);
    }
}
