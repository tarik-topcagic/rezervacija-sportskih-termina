using SportsBookingAPI.Models;

namespace SportsBookingAPI.Interfaces
{
    public interface IGradRepository
    {
        Task<IEnumerable<Grad>> GetAllGradoviAsync();
        Task<Grad> AddGradAsync(Grad grad);
    }
}
