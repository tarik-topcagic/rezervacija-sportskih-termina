using Microsoft.EntityFrameworkCore;
using SportsBookingAPI.Data;
using SportsBookingAPI.Interfaces;
using SportsBookingAPI.Models;

namespace SportsBookingAPI.Repositories
{
    public class GradRepository : IGradRepository
    {
        private readonly ApplicationDBContext _context;
        public GradRepository(ApplicationDBContext context)
        {
            _context = context;
        }
        public async Task<Grad> AddGradAsync(Grad grad)
        {
            _context.Gradovi.Add(grad);
            await _context.SaveChangesAsync();
            return grad;
        }

        public async Task<IEnumerable<Grad>> GetAllGradoviAsync()
        {
            return await _context.Gradovi.ToListAsync();
        }
    }
}
