using SportskiTerminiAPI.DTOs;
using SportskiTerminiAPI.Interfaces;
using SportskiTerminiAPI.Models;

namespace SportskiTerminiAPI.Services
{
    public class ArenaService : IArenaService
    {
        private readonly IArenaRepository _arenaRepository;

        public ArenaService(IArenaRepository arenaRepository)
        {
            _arenaRepository = arenaRepository;
        }

        public async Task<IEnumerable<ArenaDto>> GetArenasAsync(string? city, string? sportType, string? searchTerm)
        {
            var arenas = await _arenaRepository.GetArenasAsync(city, sportType, searchTerm);
            return arenas.Select(MapArena);
        }

        public async Task<ArenaDto?> GetArenaByIdAsync(int id)
        {
            var arena = await _arenaRepository.GetArenaByIdAsync(id);
            return arena == null ? null : MapArena(arena);
        }

        private static ArenaDto MapArena(Arena arena)
        {
            return new ArenaDto
            {
                Id = arena.Id,
                Name = arena.Name,
                Description = arena.Description,
                City = arena.City,
                SportType = arena.SportType,
                Address = arena.Address,
                ImageUrl = arena.ImageUrl,
                CreatedAt = arena.CreatedAt
            };
        }
    }
}
