using SportsBookingAPI.Models;

namespace SportsBookingAPI.Interfaces
{
    public interface ITokenService
    {
        Task<string> GenerateJwtToken(AppUser user);
    }
}
