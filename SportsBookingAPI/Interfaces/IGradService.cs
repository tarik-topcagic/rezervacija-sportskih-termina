using SportsBookingAPI.DTOs;
using SportsBookingAPI.Models;
using SportsBookingAPI.Services;

namespace SportsBookingAPI.Interfaces
{
    public interface IGradService
    {
        Task<ServiceResult> AddGradAsync(GradDto gradDto);
        Task<IEnumerable<Grad>> GetAllGradoviAsync();
    }
}
