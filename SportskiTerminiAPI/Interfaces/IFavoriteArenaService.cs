using SportskiTerminiAPI.Services;

namespace SportskiTerminiAPI.Interfaces
{
    public interface IFavoriteArenaService
    {
        Task<ServiceResult> AddFavoriteAsync(string userId, int arenaId);
        Task<ServiceResult> RemoveFavoriteAsync(string userId, int arenaId);
        Task<ServiceResult> GetMyFavoritesAsync(string userId);
    }
}
