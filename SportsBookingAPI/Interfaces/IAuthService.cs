using SportsBookingAPI.Models;
using SportsBookingAPI.Services;

namespace SportsBookingAPI.Interfaces
{
    public interface IAuthService
    {
        Task<ServiceResult> RegisterAsync(RegisterModel model);
        Task<ServiceResult> LoginAsync(LoginModel model);
    }
}
