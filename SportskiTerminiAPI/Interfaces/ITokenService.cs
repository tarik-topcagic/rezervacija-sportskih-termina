using SportskiTerminiAPI.Models;

namespace SportskiTerminiAPI.Interfaces
{
    public interface ITokenService
    {
        Task<string> GenerateJwtToken(AppUser user);
    }
}
