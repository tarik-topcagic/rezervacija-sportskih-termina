using SportskiTerminiAPI.Models;

namespace SportskiTerminiAPI.Interfaces
{
    public interface IArenaRepository
    {
        Task<IEnumerable<Arena>> GetArenasAsync(string? city, string? sportType, string? searchTerm);
        Task<Arena?> GetArenaByIdAsync(int id);
    }
}
