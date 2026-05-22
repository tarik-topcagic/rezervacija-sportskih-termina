using Microsoft.EntityFrameworkCore;
using SportskiTerminiAPI.Data;
using SportskiTerminiAPI.Interfaces;
using SportskiTerminiAPI.Models;

namespace SportskiTerminiAPI.Repositories
{
    public class ArenaRepository : IArenaRepository
    {
        private readonly ApplicationDBContext _context;

        public ArenaRepository(ApplicationDBContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Arena>> GetArenasAsync(string? city, string? sportType, string? searchTerm)
        {
            var query = _context.Arenas.AsNoTracking().AsQueryable();

            if (!string.IsNullOrWhiteSpace(city))
            {
                var normalizedCity = city.Trim().ToLower();
                query = query.Where(arena => arena.City.ToLower() == normalizedCity);
            }

            if (!string.IsNullOrWhiteSpace(sportType))
            {
                var normalizedSportType = sportType.Trim().ToLower();
                query = query.Where(arena => arena.SportType.ToLower() == normalizedSportType);
            }

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                var normalizedSearchTerm = searchTerm.Trim().ToLower();
                query = query.Where(arena =>
                    arena.Name.ToLower().Contains(normalizedSearchTerm) ||
                    arena.Description.ToLower().Contains(normalizedSearchTerm) ||
                    arena.Address.ToLower().Contains(normalizedSearchTerm) ||
                    arena.City.ToLower().Contains(normalizedSearchTerm) ||
                    arena.SportType.ToLower().Contains(normalizedSearchTerm));
            }

            return await query
                .OrderBy(arena => arena.City)
                .ThenBy(arena => arena.Name)
                .ToListAsync();
        }

        public async Task<Arena?> GetArenaByIdAsync(int id)
        {
            return await _context.Arenas
                .AsNoTracking()
                .FirstOrDefaultAsync(arena => arena.Id == id);
        }
    }
}
