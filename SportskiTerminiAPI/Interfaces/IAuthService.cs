using SportskiTerminiAPI.Models;
using SportskiTerminiAPI.Services;

namespace SportskiTerminiAPI.Interfaces
{
    public interface IAuthService
    {
        Task<ServiceResult> RegisterAsync(RegisterModel model);
        Task<ServiceResult> LoginAsync(LoginModel model);
    }
}
