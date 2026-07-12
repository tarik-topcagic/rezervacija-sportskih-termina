using SportskiTerminiAPI.DTOs;
using SportskiTerminiAPI.Interfaces;
using SportskiTerminiAPI.Models;

namespace SportskiTerminiAPI.Services
{
    public class ArenaService : IArenaService
    {
        private readonly IArenaRepository _arenaRepository;
        private readonly IReservationRepository _reservationRepository;

        public ArenaService(IArenaRepository arenaRepository, IReservationRepository reservationRepository)
        {
            _arenaRepository = arenaRepository;
            _reservationRepository = reservationRepository;
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

        public async Task<IEnumerable<TimeRangeDto>?> GetAvailabilityAsync(int arenaId, DateTime dateUtc)
        {
            var arena = await _arenaRepository.GetArenaByIdAsync(arenaId);
            if (arena == null)
                return null;

            return await _reservationRepository.GetConfirmedReservationsForArenaOnDateAsync(arenaId, dateUtc);
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
                PricePerHour = arena.PricePerHour,
                CreatedAt = arena.CreatedAt
            };
        }
    }
}
