using SportskiTerminiAPI.DTOs;

namespace SportskiTerminiAPI.Interfaces
{
    public interface IArenaService
    {
        Task<IEnumerable<ArenaDto>> GetArenasAsync(string? city, string? sportType, string? searchTerm);
        Task<ArenaDto?> GetArenaByIdAsync(int id);
        Task<IEnumerable<TimeRangeDto>?> GetAvailabilityAsync(int arenaId, DateTime dateUtc);
    }
}
