using Microsoft.EntityFrameworkCore;
using SportskiTerminiAPI.Data;
using SportskiTerminiAPI.Interfaces;
using SportskiTerminiAPI.Models;

namespace SportskiTerminiAPI.Repositories
{
    public class FavoriteArenaRepository : IFavoriteArenaRepository
    {
        private readonly ApplicationDBContext _context;

        public FavoriteArenaRepository(ApplicationDBContext context)
        {
            _context = context;
        }

        public async Task<FavoriteArena> AddAsync(FavoriteArena favoriteArena)
        {
            _context.FavoriteArenas.Add(favoriteArena);
            await _context.SaveChangesAsync();
            return favoriteArena;
        }

        public async Task<FavoriteArena?> GetAsync(string userId, int arenaId)
        {
            return await _context.FavoriteArenas
                .FirstOrDefaultAsync(f => f.UserId == userId && f.ArenaId == arenaId);
        }

        public async Task<IEnumerable<FavoriteArena>> GetForUserAsync(string userId)
        {
            return await _context.FavoriteArenas
                .Include(f => f.Arena)
                .Where(f => f.UserId == userId)
                .OrderByDescending(f => f.CreatedAt)
                .ToListAsync();
        }

        public async Task RemoveAsync(int id)
        {
            var favoriteArena = await _context.FavoriteArenas.FindAsync(id);
            if (favoriteArena != null)
            {
                _context.FavoriteArenas.Remove(favoriteArena);
                await _context.SaveChangesAsync();
            }
        }
    }
}
